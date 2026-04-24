// Lazy-load the pipeline once and cache it (model is ~90MB, first load downloads it)
let embedderPromise = null;

const getEmbedder = async () => {
  if (!embedderPromise) {
    const { pipeline, env } = await import("@xenova/transformers");
    env.allowLocalModels = false;
    env.useBrowserCache = false;
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderPromise;
};

const embedText = async (text) => {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

const embedBatch = async (texts) => {
  const embedder = await getEmbedder();
  const results = [];
  for (const text of texts) {
    const output = await embedder(text, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data));
  }
  return results;
};

// Split text into overlapping chunks. Prefer paragraph/sentence boundaries.
const chunkText = (rawText, chunkSize = 800, overlap = 100) => {
  const text = rawText.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    // Try to break at a sentence boundary if we're not at the end
    if (end < text.length) {
      const slice = text.slice(start, end);
      const lastPeriod = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("\n")
      );
      if (lastPeriod > chunkSize * 0.5) {
        end = start + lastPeriod + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 20) chunks.push(chunk);

    if (end >= text.length) break;
    start = end - overlap;
  }

  return chunks;
};

// Cosine similarity for normalized vectors is just dot product
const cosineSimilarity = (a, b) => {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
};

// Given a query embedding and list of { id, embedding, ...meta }, return top-k.
const findTopK = (queryEmbedding, items, k = 5) => {
  const scored = items.map((item) => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
};

module.exports = {
  embedText,
  embedBatch,
  chunkText,
  cosineSimilarity,
  findTopK,
};
