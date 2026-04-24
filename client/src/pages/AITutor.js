import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { streamSSE } from "../api/sse";
import { FiSend, FiLoader } from "react-icons/fi";

const AITutor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get("/ai/chat-history");
      const history = data.reverse().flatMap((item) => [
        { role: "user", content: item.question },
        { role: "ai", content: item.aiResponse },
      ]);
      setMessages(history);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "ai", content: "", streaming: true },
    ]);
    setInput("");
    setLoading(true);

    const patchLastAI = (patch) => {
      setMessages((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        if (next[last]?.role === "ai") next[last] = { ...next[last], ...patch };
        return next;
      });
    };

    const appendToken = (token) => {
      setMessages((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        if (next[last]?.role === "ai") {
          next[last] = { ...next[last], content: next[last].content + token };
        }
        return next;
      });
    };

    try {
      await streamSSE("/ai/tutor", { question }, {
        onEvent: (evt) => {
          if (evt.type === "token") appendToken(evt.text);
          else if (evt.type === "done") patchLastAI({ streaming: false });
          else if (evt.type === "error") patchLastAI({ content: "Error: " + evt.message, streaming: false });
        },
      });
    } catch (err) {
      patchLastAI({ content: "Sorry, something went wrong: " + err.message, streaming: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Tutor</h1>
      <p className="text-gray-500 mb-4">Ask me anything about any topic. I'll explain it clearly with examples.</p>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-lg">Start a conversation!</p>
            <p className="text-sm mt-2">Try: "Explain closures in JavaScript" or "What is REST API?"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${
              msg.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-white shadow text-gray-700"
            }`}>
              {msg.role === "ai" && msg.streaming && !msg.content ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <FiLoader className="animate-spin" /> Thinking...
                </div>
              ) : (
                <p className="whitespace-pre-wrap">
                  {msg.content}
                  {msg.role === "ai" && msg.streaming && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-500 align-middle animate-pulse" />
                  )}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button
          type="submit" disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default AITutor;
