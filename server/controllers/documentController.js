const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const { Document, DocumentChunk } = require("../models");
const { embedText, embedBatch, chunkText, findTopK, generateChunkContext } = require("../services/ragService");
const { askAIStream } = require("../services/aiService");
// POST /api/documents/upload
const uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = req.file.path;
  const title = req.body.title || req.file.originalname.replace(/\.pdf$/i, "");

  let doc;
  try {
    doc = await Document.create({
      userId: req.user.id,
      title,
      filename: req.file.filename,
      status: "processing",
    });
  } catch (err) {
    return res.status(500).json({ message: "Could not create document record: " + err.message });
  }

  // Respond immediately, then process in background
  res.status(202).json({
    message: "Document uploaded, processing started",
    document: doc,
  });

  // Background: parse PDF, chunk, embed, save
  processDocument(doc, filePath).catch(async (err) => {
    console.error("Document processing failed:", err);
    await doc.update({ status: "failed", errorMessage: err.message });
  });
};

const processDocument = async (doc, filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const parsed = await parser.getText();

  // Strip out pdf-parse's page-marker lines like "-- 1 of 5 --" before measuring
  const rawText = (parsed.text || "").trim();
  const realText = rawText.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "").replace(/\s+/g, " ").trim();

  const SCANNED_PDF_MSG =
    "This PDF has no extractable text — it looks scanned or image-based. OCR is not supported. " +
    "Try a text-based PDF (e.g. one exported from Word/Google Docs, or a research paper with selectable text).";

  if (realText.length < 100) {
    throw new Error(SCANNED_PDF_MSG);
  }

  // Build per-page chunks so we can cite page numbers accurately
  const allChunks = [];
  const pages = parsed.pages || [];
  if (pages.length > 0) {
    pages.forEach((pageObj, pageIdx) => {
      const pageText = (pageObj.text || "")
        .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
        .trim();
      if (pageText.length < 20) return;
      const pieces = chunkText(pageText, 800, 100);
      pieces.forEach((piece) => {
        allChunks.push({ text: piece, pageNumber: pageIdx + 1 });
      });
    });
  }

  // Fallback: if per-page gave us nothing but the overall text was fine, chunk the overall text
  if (allChunks.length === 0 && realText.length >= 100) {
    const pieces = chunkText(realText,800,100);
    pieces.forEach((piece) => allChunks.push({ text: piece, pageNumber: 1 }));
  }

  if (allChunks.length === 0) throw new Error(SCANNED_PDF_MSG);

    // Contextual Retrieval: add document-level context to each chunk before embedding
  for (let i = 0; i < allChunks.length; i++) {
    const context = await generateChunkContext(realText, allChunks[i].text);
    allChunks[i].text = context + "\n\n" + allChunks[i].text;
  }

   console.log("[CTX TEST] First chunk:", allChunks[0].text.substring(0, 300));

  const embeddings = await embedBatch(allChunks.map((c) => c.text));

  const rows = allChunks.map((c, index) => ({
    documentId: doc.id,
    chunkIndex: index,
    text: c.text,
    embedding: JSON.stringify(embeddings[index]),
    pageNumber: c.pageNumber,
  }));

  await DocumentChunk.bulkCreate(rows);

  await doc.update({
    pageCount: parsed.total || pages.length || 0,
    chunkCount: allChunks.length,
    status: "ready",
  });

  console.log(`Document ${doc.id} processed: ${allChunks.length} chunks across ${parsed.total || pages.length} pages`);
};

// GET /api/documents
const listDocuments = async (req, res) => {
  try {
    const docs = await Document.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/documents/:id
const getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/documents/:id/ask — streams tokens via SSE
const askDocument = async (req, res) => {
  const send = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    const doc = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.status !== "ready") {
      return res.status(400).json({ message: `Document status: ${doc.status}. Try again when ready.` });
    }

    const allChunks = await DocumentChunk.findAll({
      where: { documentId: doc.id },
      attributes: ["id", "chunkIndex", "text", "embedding", "pageNumber"],
    });

    if (allChunks.length === 0) {
      return res.status(400).json({ message: "Document has no indexed chunks" });
    }

    // Do retrieval BEFORE opening the SSE stream so we can still return 4xx/5xx cleanly
    const queryEmbedding = await embedText(question);

    const items = allChunks.map((c) => ({
      id: c.id,
      chunkIndex: c.chunkIndex,
      text: c.text,
      pageNumber: c.pageNumber,
      embedding: JSON.parse(c.embedding),
    }));

    const topChunks = findTopK(queryEmbedding, items, 5);

    const context = topChunks
      .map((c, i) => `[Source ${i + 1}] (chunk ${c.chunkIndex})\n${c.text}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are BrainPath RAG Assistant. Your role is to answer questions strictly grounded in provided sources.

      Rules:
      - Use ONLY the information inside the <sources> tags
      - Cite sources inline like [Source 1], [Source 2] where each claim comes from
      - If sources don't contain enough info, output exactly: "I don't have enough information in this document to answer that."
      - Be concise. Direct answer first, supporting details after.`;

      const userPrompt = `<document_title>${doc.title}</document_title>

      <sources>
      ${context}
      </sources>

      <question>${question}</question>

      <answer>`;

    // Open SSE stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    // Send citations first so the UI can render source cards immediately,
    // then stream tokens into the answer bubble
    send({
      type: "citations",
      citations: topChunks.map((c, i) => ({
        sourceNumber: i + 1,
        chunkIndex: c.chunkIndex,
        pageNumber: c.pageNumber,
        score: Number(c.score.toFixed(4)),
        text: c.text.slice(0, 300) + (c.text.length > 300 ? "..." : ""),
      })),
    });

    await askAIStream(userPrompt, systemPrompt, (token) => {
      send({ type: "token", text: token });
    });

    send({ type: "done" });
    res.end();
  } catch (error) {
    console.error("askDocument error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
    // Headers already sent (SSE open) — emit error event and close
    send({ type: "error", message: error.message });
    res.end();
  }
};

// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Best-effort file cleanup
    const filePath = path.join("uploads", doc.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
    }

    await DocumentChunk.destroy({ where: { documentId: doc.id } });
    await doc.destroy();
    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  askDocument,
  deleteDocument,
};
