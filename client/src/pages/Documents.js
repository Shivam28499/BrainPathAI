import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { streamSSE } from "../api/sse";
import { FiUpload, FiFileText, FiTrash2, FiSend, FiLoader } from "react-icons/fi";

const StatusBadge = ({ status }) => {
  const styles = {
    processing: "bg-yellow-100 text-yellow-700",
    ready: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatPanelRef = useRef(null);

  useEffect(() => {
    fetchDocs();
    const poll = setInterval(fetchDocs, 4000); // poll while any doc is processing
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDocs = async () => {
    try {
      const { data } = await API.get("/documents");
      setDocs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name.replace(/\.pdf$/i, ""));

    setUploading(true);
    try {
      await API.post("/documents/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDocs();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document and its embeddings?")) return;
    try {
      await API.delete(`/documents/${id}`);
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
        setMessages([]);
      }
      await fetchDocs();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSelect = (doc) => {
    if (doc.status !== "ready") return;
    setSelectedDoc(doc);
    setMessages([]);
    setTimeout(() => {
      chatPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedDoc || asking) return;

    const question = input.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "ai", content: "", citations: [], streaming: true },
    ]);
    setInput("");
    setAsking(true);

    const updateLastAI = (patch) => {
      setMessages((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (next[lastIdx]?.role === "ai") {
          next[lastIdx] = { ...next[lastIdx], ...patch };
        }
        return next;
      });
    };

    const appendToken = (token) => {
      setMessages((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (next[lastIdx]?.role === "ai") {
          next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + token };
        }
        return next;
      });
    };

    try {
      await streamSSE(
        `/documents/${selectedDoc.id}/ask`,
        { question },
        {
          onEvent: (evt) => {
            if (evt.type === "token") appendToken(evt.text);
            else if (evt.type === "citations") updateLastAI({ citations: evt.citations || [] });
            else if (evt.type === "error") updateLastAI({ content: "Error: " + evt.message, streaming: false });
            else if (evt.type === "done") updateLastAI({ streaming: false });
          },
        }
      );
    } catch (err) {
      updateLastAI({ content: "Error: " + err.message, streaming: false });
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Chat with your Documents</h1>
        <p className="text-gray-500 mt-1">
          Upload a PDF and ask questions. Answers are grounded in your document with citations.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* LEFT: Doc list + upload */}
        <div className="md:col-span-2 space-y-4">
          <label className="block">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition ${
                uploading
                  ? "border-gray-300 bg-gray-50 cursor-wait"
                  : "border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50"
              }`}
            >
              {uploading ? (
                <>
                  <FiLoader className="mx-auto text-indigo-500 animate-spin" size={28} />
                  <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <FiUpload className="mx-auto text-indigo-500" size={28} />
                  <p className="mt-2 text-sm text-gray-700 font-medium">Click to upload PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Max 50MB · text-based PDFs only (scanned PDFs need OCR, not supported)</p>
                </>
              )}
            </div>
          </label>

          <div className="bg-white rounded-xl shadow-sm divide-y">
            {docs.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">No documents yet. Upload one above.</div>
            )}
            {docs.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 flex items-start justify-between gap-3 ${
                  doc.status === "ready" ? "cursor-pointer hover:bg-indigo-50" : ""
                } ${selectedDoc?.id === doc.id ? "bg-indigo-50" : ""}`}
                onClick={() => handleSelect(doc)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FiFileText className="text-indigo-500 flex-shrink-0 mt-0.5" size={20} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 truncate">{doc.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <StatusBadge status={doc.status} />
                      {doc.status === "ready" && (
                        <span>
                          {doc.pageCount} pages · {doc.chunkCount} chunks
                        </span>
                      )}
                    </div>
                    {doc.status === "failed" && doc.errorMessage && (
                      <div className="text-xs text-red-600 mt-1 leading-snug">{doc.errorMessage}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Chat panel */}
        <div className="md:col-span-3" ref={chatPanelRef}>
          {!selectedDoc ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
              <FiFileText size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">Select a ready document to start asking questions</p>
              <p className="text-sm mt-2">RAG will retrieve the most relevant sections and answer with citations.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm flex flex-col h-[calc(100vh-220px)]">
              <div className="p-4 border-b">
                <div className="font-semibold text-gray-800 truncate">{selectedDoc.title}</div>
                <div className="text-xs text-gray-500">
                  {selectedDoc.pageCount} pages · {selectedDoc.chunkCount} chunks indexed
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10 text-sm">
                    <p>Ask a question about this document.</p>
                    <p className="mt-2 text-xs">Example: "Summarize the main findings" or "What does it say about X?"</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${msg.role === "user" ? "" : "w-full"}`}>
                      <div
                        className={`p-3 rounded-xl ${
                          msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-800"
                        }`}
                      >
                        {msg.role === "ai" && msg.streaming && !msg.content ? (
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FiLoader className="animate-spin" /> Retrieving sources and generating answer...
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                            {msg.role === "ai" && msg.streaming && (
                              <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-500 align-middle animate-pulse" />
                            )}
                          </p>
                        )}
                      </div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-medium text-gray-500">Sources:</div>
                          {msg.citations.map((c) => (
                            <details key={c.sourceNumber} className="bg-white border rounded-lg text-xs">
                              <summary className="cursor-pointer px-3 py-2 flex items-center justify-between hover:bg-gray-50">
                                <span className="font-medium text-indigo-600">
                                  [Source {c.sourceNumber}] · Page {c.pageNumber}
                                </span>
                                <span className="text-gray-400">score: {c.score}</span>
                              </summary>
                              <div className="px-3 pb-3 text-gray-600 leading-relaxed">{c.text}</div>
                            </details>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleAsk} className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about this document..."
                  disabled={asking}
                  className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={asking || !input.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FiSend />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
