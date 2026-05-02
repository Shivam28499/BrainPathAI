# BrainPath AI — Internals & Design Decisions

A breakdown of every key technical choice in BrainPath AI, written for
interview prep and as living documentation of the codebase.

---

## 1. What is RAG and why is it better than just sending the whole PDF to the LLM?

RAG stands for **Retrieval Augmented Generation**. Instead of stuffing an
entire PDF into the LLM's context window, I:

1. Split the PDF into small chunks ahead of time.
2. Convert each chunk into a vector embedding.
3. At query time, retrieve only the **top-K most relevant chunks** for the
   user's question and send those, along with the question, to the LLM.

This is better than sending the whole PDF for four reasons:

- **Context window** — LLMs have a hard token limit. A 200-page PDF won't fit.
- **Cost** — LLM API pricing is per token. Sending only the 5 most relevant
  chunks keeps each query cheap.
- **Accuracy** — More irrelevant text in the prompt means more chances for the
  model to get distracted or hallucinate. Focused context produces focused
  answers.
- **Speed** — Smaller prompts → faster generation. 

So RAG = retrieve relevant context first, then generate.

---

## 2. Walk through what happens when a user uploads a PDF, end to end.

1. User selects a PDF in the React frontend; multer receives it on the
   backend at `POST /api/documents/upload`.
2. The controller saves the file to `uploads/` and creates a `Document` row
   in Postgres with `status: "processing"`.
3. The server **immediately responds 202 Accepted** with the document
   record. The user isn't blocked while processing happens.
4. Processing runs in the background:
   - `pdf-parse` extracts text per page.
   - The text is normalized (whitespace collapsed, page-marker noise like
     `-- 1 of 5 --` stripped).
   - If the extracted text is < 100 chars, the PDF is treated as scanned/
     image-only and a clear error is thrown so the user knows OCR is unsupported.
   - Each page's text is split with `chunkText` into ~800-char overlapping
     chunks (overlap 100). Each chunk records its `pageNumber`.
   - All chunk texts are passed to `embedBatch`, which produces 384-dim
     vectors using MiniLM-L6-v2.
   - All chunks are written to `DocumentChunk` via `bulkCreate`, with the
     embedding stored as a JSON-stringified array in a TEXT column.
   - `Document.update` flips `status` to `"ready"` and records `pageCount`
     and `chunkCount`.
5. The frontend polls `/api/documents/:id` every few seconds until the
   status is `"ready"`, then enables the "Ask a question" UI.

---

## 3. Walk through what happens when a user asks a question, end to end.

1. The frontend calls `POST /api/documents/:id/ask` with the question via
   `streamSSE` (fetch + ReadableStream so JWT auth headers can be sent).
2. The controller validates: question non-empty, document belongs to this
   user (via `userId` scoping), document `status === "ready"`.
3. It loads all `DocumentChunk` rows for that document (id, text,
   embedding-as-JSON, pageNumber).
4. It calls `embedText(question)` to get a 384-dim query vector.
5. For each chunk, it `JSON.parse`s the stored embedding back into a
   number array.
6. `findTopK(queryEmbedding, items, 5)` scores every chunk by cosine
   similarity and returns the top 5.
7. It builds a system prompt that constrains the LLM to use only the
   provided sources and a user prompt that lists the 5 chunks as
   `[Source 1] … [Source 5]` followed by the question.
8. It opens an SSE stream (Content-Type: text/event-stream, no caching,
   keep-alive, X-Accel-Buffering: no).
9. It sends a `citations` SSE event first so the UI can render source
   cards immediately while the answer is still generating.
10. It calls `askAIStream` against Groq with `stream: true`. For every
    token the model produces, the callback writes a `token` SSE event.
11. When streaming finishes, it sends a `done` event and closes the
    response.
12. If anything errors before the SSE stream is open it returns a normal
    JSON 4xx/5xx; if it errors after the stream is open it sends an
    `error` SSE event and closes.

---

## 4. Why 800-char chunks with 100-char overlap?

800 characters is roughly 150–200 words, or about one paragraph. That size
is a sweet spot because:

- It's **big enough** to contain a complete idea or argument, so the
  embedding represents a focused topic rather than half-a-thought.
- It's **small enough** that 5 retrieved chunks comfortably fit inside
  the LLM's context window with room for the prompt and response.
- It's **small enough** that the embedding stays semantically focused
  (a 2000-char chunk covering 3 unrelated paragraphs would produce a
  fuzzy "average" vector that retrieves poorly).

100-char overlap (~15-20 words) preserves continuity across boundaries.
If a sentence happens to span chunks 3 and 4, the overlap ensures the
sentence appears intact in at least one of them.

If I went to **1500 chars / 300 overlap**: chunks become broader, embeddings
get fuzzier, retrieval precision drops, but I'd have fewer chunks and faster
indexing. Useful for long-form prose where ideas are paragraph-scale.

If I went to **300 chars / 50 overlap**: chunks become very focused but
often lose context (a chunk might be one sentence). Retrieval can return
correct-but-incomplete passages.

---

## 5. What do the 384 dimensions in a MiniLM embedding actually represent?

384 is the **size** of the output vector — every input string becomes
exactly 384 floating-point numbers. It is a design choice of the
MiniLM-L6-v2 architecture (a 6-layer transformer that maps text into a
384-dimensional vector space).

Each individual number does **not** have a clean human-readable meaning —
the model wasn't trained with "dimension 0 = positivity, dimension 1 =
formality." Instead, meaning is **distributed** across all 384 dimensions
in entangled ways. What matters is the **pattern** across all 384
positions; similar inputs produce similar patterns, and that's what makes
similarity comparisons work.

384 is a tradeoff: bigger embeddings (768, 1536, 3072) carry more
information but cost more memory, storage, and compute. 384 is small
enough to run on CPU at ~50–200ms per query and store in 1.5 KB per
chunk, which is what makes free-tier deployment practical.

---

## 6. Why cosine similarity instead of Euclidean distance?

Cosine similarity measures the **angle** between two vectors; Euclidean
measures the **straight-line distance** between their endpoints.

For text meaning, we want to measure direction in the embedding space,
not magnitude. Two sentences about "React" — one short, one long — might
produce vectors of different lengths but pointing in the same direction.
Cosine treats them as similar (angle near 0); Euclidean would say they're
far apart (different lengths).

Concretely: if I have `[1,1]` and `[10,10]`, cosine similarity is 1.0
(perfectly parallel) but Euclidean distance is ~12.7 (very far). For
semantic search I want length-invariance, so cosine wins.

There's also a performance bonus: I normalize all embeddings to length 1
when I create them (`normalize: true`), which means cosine similarity
reduces to a simple dot product — `sum of a[i]*b[i]`. No division, no
square root. Fast and clean.

---

## 7. What's the time complexity of my current retrieval and where does it break at scale?

Each query does a brute-force scan over every chunk in the document:

- For each chunk, compute cosine similarity (one dot product over 384
  dimensions).
- Sort by score, take top 5.

That's **O(N × D)** where N = number of chunks and D = 384. For one user
with one document (~50–500 chunks), this is trivial — single-digit
milliseconds.

Where it breaks:
- A user with many large documents (5000+ chunks each) — query latency
  grows linearly.
- Multi-user scale (1000+ users × 50 chunks/user = 50k+ chunks if I ever
  did global cross-user search) — same problem.

Fix path:
- Migrate to **pgvector** (Postgres native vector type) and add an
  **HNSW index**. Approximate nearest-neighbor search is sub-linear,
  effectively O(log N). At a million chunks this means ~20 comparisons
  per query instead of a million.
- For very large scale (10M+ chunks), a dedicated vector DB like
  Pinecone, Qdrant, or Weaviate.

---

## 8. Why SSE instead of WebSockets for streaming LLM responses?

Server-Sent Events fits the use case exactly: the data flow is **one-way,
server → client**. The user sends one HTTP request and the server
responds with a stream of events over time. There's no need for the
browser to push data mid-stream.

SSE gives me:
- **Standard HTTP** — works through corporate proxies, load balancers,
  and CDNs without special configuration.
- **Simpler protocol** — no handshake, no framing. Just `data: …\n\n`
  events on a regular HTTP response.
- **Automatic browser reconnect** when the connection drops.
- **Same auth model as REST** — JWT in the Authorization header.

WebSockets are bidirectional and would be the right pick for true
real-time, two-way scenarios — chat with multiple users typing at once,
multiplayer games, collaborative editing. My ChatApp project uses
Socket.IO for exactly that reason. BrainPath AI's LLM streaming is
strictly one-way, so SSE is the simpler, lower-friction choice.

---

## 9. Why couldn't I use EventSource? What does fetch + ReadableStream solve?

`EventSource` is the browser's built-in SSE client. It's simple to use,
but it has a critical limitation: **it cannot send custom request headers**.
In particular, it cannot send `Authorization: Bearer <jwt>`.

My API requires a JWT on every protected request, including the SSE
endpoints (`/api/ai/tutor`, `/api/documents/:id/ask`). Without the
ability to attach an auth header, EventSource is unusable.

Workaround: I use `fetch` (which fully supports custom headers) plus
manual SSE parsing of the response body via `response.body.getReader()`
and `TextDecoder`. The wire protocol is identical — `data: ...\n\n`
events — but I parse them myself instead of relying on the browser API.

That's all `client/src/api/sse.js` does:
1. `fetch` with the Authorization header
2. Read the response body as a stream
3. Buffer incoming bytes; split on `\n\n` to find complete events
4. JSON-parse each `data: ...` line and call `onEvent(evt)`

Slightly more code than EventSource, but the right tradeoff when standard
SSE doesn't fit.

---

## 10. How does Groq's streaming protocol work? What are tokens vs chunks?

When I call `groq.chat.completions.create({ stream: true })`, Groq returns
an **async iterable** instead of a single completed response. I consume
it with `for await (const chunk of stream)`.

- **Token** = a small unit of text the LLM produces, typically one word
  or word-fragment (~4 characters on average). Llama-3.3 generates one
  token at a time: `"React"`, then `" is"`, then `" a"`, then `" library"`.
  Each token is selected from the model's ~32k-token vocabulary.

- **Chunk** = one HTTP message in Groq's streaming response. Each chunk
  is a JSON object containing zero or more new tokens in
  `chunk.choices[0].delta.content`. Usually it's exactly one token, but
  Groq can occasionally batch multiple.

So tokens are the **model's output unit**, and chunks are the **transport
unit** that carries them.

In my `askAIStream`:

```js
for await (const chunk of stream) {
  const delta = chunk.choices?.[0]?.delta?.content || "";
  if (delta) {
    fullText += delta;     // accumulate for DB persistence
    onToken(delta);        // forward to the SSE callback
  }
}
return fullText;
```

The optional chaining (`?.`) is defensive — Groq sometimes sends keep-
alive heartbeats with no `delta.content`, and I want to skip those
gracefully instead of crashing.

---

## 11. What happens to my MiniLM model on cold start? Why ~90 MB?

`@xenova/transformers` doesn't ship the model weights — they're downloaded
from Hugging Face on first use. The first time `getEmbedder()` is called,
the library:

1. Fetches the MiniLM-L6-v2 weights (~90 MB) from Hugging Face's CDN.
2. Loads them into memory.
3. Returns a callable embedder function.

After that, the model lives in the Node.js process memory. Subsequent
calls reuse it instantly — no download, no re-load.

The 90 MB number comes from the model architecture: 6 transformer layers
× ~14M parameters × 4 bytes (float32) plus the token embedding lookup
table.

On Render's free tier this matters because the dyno spins down after 15
minutes of inactivity. The next request after a spin-down has to re-
download the model, adding 10-30 seconds of latency to whichever user
shows up first. In production I'd either keep the dyno warm with a cron
ping or pre-cache the model in a Docker image.

---

## 12. How do my page-level citations work? Where does pageNumber come from?

`pdf-parse` returns text broken down by page (`parsed.pages`). When I
process a document, I chunk **each page's text separately** instead of
chunking the whole document at once. Each chunk produced from page N is
tagged with `pageNumber: N + 1` (humans count pages from 1).

```js
pages.forEach((pageObj, pageIdx) => {
  const pieces = chunkText(pageText, 800, 100);
  pieces.forEach((piece) => {
    allChunks.push({ text: piece, pageNumber: pageIdx + 1 });
  });
});
```

When I save chunks to `DocumentChunk`, the `pageNumber` field is stored
alongside the text and embedding.

At query time, the top-K chunks I retrieve still carry their
`pageNumber`. I include it in the `citations` SSE event:

```js
citations: topChunks.map((c, i) => ({
  sourceNumber: i + 1,
  pageNumber: c.pageNumber,
  score: Number(c.score.toFixed(4)),
  text: c.text.slice(0, 300) + "..."
}))
```

The frontend then renders source cards that show "Source 1, page 12"
etc. — letting the user click straight to the relevant page in the PDF.

The fallback path (when pdf-parse can't give per-page breakdown) lumps
all chunks into `pageNumber: 1`, so citations still render but page
attribution is degraded.

---

## 13. If a user uploads a 500-page PDF, how many DB rows would that create? How does query time scale?

**Sizing:**
- A page has ~3000 chars of clean text on average (after whitespace
  normalization).
- With 800-char chunks and 100-char overlap, each page produces about
  4-5 chunks.
- 500 pages × ~4.5 chunks/page ≈ **2250 chunks** = 2250 rows in
  `DocumentChunk`.

Each row stores:
- `text`: ~800 chars
- `embedding`: 384 floats serialized as JSON (~3 KB string)
- `pageNumber`, `chunkIndex`, `documentId`, `id`

So roughly 4 KB per row × 2250 rows ≈ **9 MB per document** in storage.

**Query time:**
At question-time I load **all** chunks for that document and brute-force
cosine over all of them. With 2250 vectors of 384 dims:

- Total math: 2250 × 384 ≈ 864,000 multiplications + additions per query.
- On a modern CPU, that's ~5-15 ms in pure math.
- Add Postgres roundtrip + JSON.parse of 2250 stored embeddings: another
  100-300 ms.

Still fast enough for a single doc. But across many large docs, the
JSON.parse step alone becomes the bottleneck — that's the strongest
argument for migrating to pgvector, where the cosine math happens in the
DB engine and there's no per-query JSON deserialization.

---

## 14. What's my plan to migrate from JSON-in-TEXT to pgvector?

The current schema stores embeddings as JSON-encoded TEXT. Postgres can
do real vector math if I install the `pgvector` extension. Migration
plan:

1. **Install the extension** in Postgres:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Add a new column** to `DocumentChunk`:

   ```sql
   ALTER TABLE document_chunks ADD COLUMN embedding_vec VECTOR(384);
   ```

3. **Backfill the new column** from the existing JSON, in batches:

   ```js
   const rows = await DocumentChunk.findAll({ ... });
   for (const row of rows) {
     const arr = JSON.parse(row.embedding);
     await sequelize.query(
       `UPDATE document_chunks SET embedding_vec = $1::vector WHERE id = $2`,
       { bind: [arr, row.id] }
     );
   }
   ```

4. **Add an HNSW index** for sub-linear search:

   ```sql
   CREATE INDEX ON document_chunks USING hnsw (embedding_vec vector_cosine_ops);
   ```

5. **Replace** the Node-side `findTopK` with a SQL query:

   ```sql
   SELECT id, text, page_number, embedding_vec <=> $1 AS distance
   FROM document_chunks
   WHERE document_id = $2
   ORDER BY distance ASC
   LIMIT 5;
   ```

   The `<=>` operator is pgvector's cosine distance. Lower = more similar.

6. **Run dual-write for a period** (write both columns) to validate the
   new path on real traffic.

7. **Drop the old TEXT column** once verified.

The big win is **index acceleration** — HNSW is sub-linear, so retrieval
scales to millions of chunks. The secondary win is removing the
`JSON.parse` overhead from every query.

---

## 15. If I had to scale BrainPath to 100,000 users, what's the first thing that would break?

Several things would break, in this order:

**First: brute-force cosine in Node.** With 100k users × ~50 chunks/user
= 5M chunks, every query would do 5M × 384 multiplications + a 5M-row
JSON.parse. That's seconds-to-minutes of CPU per query — completely
unviable. Fix: pgvector with HNSW (Q14 plan).

**Second: synchronous embedding in the request path.** Right now upload
processing blocks the worker until embedding is done. With many concurrent
uploads, request handlers pile up. Fix: move embedding to a background
job queue (BullMQ, RabbitMQ) with multiple workers, and let the upload
endpoint return 202 instantly without spawning the embedding work
inline.

**Third: ephemeral filesystem for uploads.** On Render free tier, every
restart wipes `uploads/`. At 100k users that's a constant data-loss risk.
Fix: stream uploads directly to S3/Cloudinary and stop using local disk
entirely.

**Fourth: Groq cost.** At 100k users × even 5 questions/day average × 5
chunks of ~800 chars = millions of tokens billed daily. Need rate
limiting per user, prompt-cache (Anthropic-style) to dedupe identical
questions, and a smaller/cheaper model for low-stakes queries.

**Fifth: MiniLM single-process.** One Node process can only embed so fast.
Need horizontal scaling — multiple worker replicas behind a load
balancer. Render free tier doesn't support this; would need to upgrade.

**Sixth: PDF storage.** 100k users × 10 PDFs × 5 MB ≈ 5 TB. Postgres can
hold the chunk text + embeddings (cheaper), but raw PDFs should live in
object storage (S3) with lifecycle rules to archive old uploads to
cheaper tiers.

The first three are the immediate technical bottlenecks; the last three
are cost and infra constraints that come up shortly after.

---

## Author

Built by Shivam Kumar — Full-Stack MERN + AI Engineer.