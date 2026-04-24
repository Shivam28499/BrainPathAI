// Streams SSE events from a POST endpoint that requires auth.
// EventSource doesn't support custom headers, so we use fetch + ReadableStream.
//
// Usage:
//   await streamSSE('/documents/5/ask', { question: 'hi' }, {
//     onEvent: (evt) => { ... },  // { type: 'token'|'citations'|'done'|'error', ... }
//   });

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function streamSSE(path, body, { onEvent, signal } = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  // Non-stream error (e.g. 400/404/500 JSON response)
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("text/event-stream")) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) errMsg = data.message;
    } catch (_) { /* ignore */ }
    throw new Error(errMsg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by \n\n
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || ""; // last piece may be incomplete

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const json = line.slice(5).trim();
      if (!json) continue;
      try {
        const evt = JSON.parse(json);
        onEvent?.(evt);
      } catch (err) {
        console.error("Bad SSE event:", json, err);
      }
    }
  }
}
