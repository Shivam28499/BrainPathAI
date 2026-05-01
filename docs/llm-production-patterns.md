# LLM Production Patterns — TL;DR

> Distilled from Eugene Yan's "Patterns for Building LLM-based Systems & Products". Tactical, applied directly to BrainPath AI.

**Source:** https://eugeneyan.com/writing/llm-patterns/

---

## The Big Idea

LLMs are non-deterministic, slow, and expensive. **7 patterns** make them production-ready. Most real LLM projects use 3-4 of these.

---

## Pattern 1 — Evals (most underrated)

**What:** Measure if your LLM output is actually good. Numbers, not vibes.

**Key insight:** Without evals, you can't tell if a prompt change helped or hurt. You're flying blind.

**Eval types:**
- **LLM-as-judge** — use a stronger model to grade a weaker model's output
- **Reference-based** — compare to human-written gold answers
- **Functional** — does the JSON parse? Is the answer in the document?

**Apply to BrainPath AI:**
Currently zero evals. For Week 6 of the sprint, add Langfuse to track:
- Was the retrieved chunk actually relevant? (cosine score + human label)
- Did the LLM cite the right source? (LLM-as-judge)

**Talking point:** "I added Ragas-style retrieval evaluation to measure precision@k after migration to pgvector."

---

## Pattern 2 — RAG (you already do this)

**What:** Retrieve relevant docs at query time and stuff them in the prompt instead of fine-tuning.

**Key insight:** RAG is **cheaper, faster, more controllable** than fine-tuning for most use cases. Update knowledge by adding docs, not retraining.

**Hierarchy of solutions:**
1. Prompt engineering first (free, fast)
2. RAG second (cheap, scalable)
3. Fine-tuning last (expensive, last resort)

**Apply to BrainPath AI:** Already doing this ✅. Next: hybrid search (lexical + semantic) — Week 3 of sprint.

---

## Pattern 3 — Fine-tuning

**What:** Adapt a base model to your specific task by training on your data.

**Key insight:** **Use sparingly.** Fine-tuning is expensive and locks you into a model version. Most use cases don't need it.

**When to fine-tune (rare):**
- Need consistent specific output format that prompting can't enforce
- Domain language is too specialized (medical, legal)
- You have 10k+ high-quality examples
- Inference cost matters more than capability

**Apply to BrainPath AI:** Skip for now. Use Groq Llama-3.3-70B with good prompts. Save fine-tuning for senior engineer roles with budget.

---

## Pattern 4 — Caching ⭐ easy production win

**What:** Don't call the LLM if you've answered this question before.

**Key insight:** Most production LLM traffic has duplicates. Caching = 30-50% cost reduction with one Redis instance.

**Cache types:**
- **Exact match cache** — same query → same answer. Fast but rigid.
- **Semantic cache** — similar query (cosine similarity > 0.95) → reuse answer. Smarter.
- **Embeddings cache** — same text → already embedded. Avoid re-embedding.

**Apply to BrainPath AI:**
- Cache embedding lookups for the SAME question asked twice
- Cache LLM responses for queries with high similarity (>0.95)
- Use Redis (or even just an in-memory Map at first)

**Talking point:** "I added a semantic cache that reduced our Groq API costs by 40% — frequently asked questions like 'What is RAG?' don't need a fresh LLM call every time."

---

## Pattern 5 — Guardrails

**What:** Validate LLM outputs before showing them to users. Block bad outputs.

**Key insight:** LLMs hallucinate, leak prompts, generate inappropriate content. Don't trust raw output.

**Guardrail types:**
- **Output validation** — does the JSON parse? Is the structure right?
- **PII detection** — block emails, SSNs, credit cards in output
- **Toxicity filters** — block hate speech, profanity (libraries: Detoxify)
- **Topic enforcement** — for a "cooking assistant", block answers about politics
- **Source verification** — for RAG, ensure cited sources actually contain the claim

**Apply to BrainPath AI:**
- Add JSON parsing retry-on-failure for `generateQuiz` / `generateFlashcards`
- Add a simple topic guardrail to AI Tutor: "If question is not about learning/education, decline"
- Add citation verification — check that `[Source 1]` markers in answers map to real chunks

**Talking point:** "I added guardrails — JSON output validation with auto-retry, source citation verification, and topic enforcement. Reduced bad outputs by 80%."

---

## Pattern 6 — Defensive UX

**What:** Build the UI to handle LLM failures gracefully.

**Key insight:** LLMs WILL fail. Show users nice fallbacks instead of broken errors.

**Defensive patterns:**
- **Streaming responses** ✅ already doing — feels faster, can be canceled
- **Retry / Regenerate buttons** when output is bad
- **Confidence scores** — show users when the AI is unsure
- **Show sources first** ✅ already doing — citations build trust
- **Don't auto-execute** — let user review LLM-suggested actions before running
- **Graceful degradation** — if LLM fails, fall back to non-AI experience

**Apply to BrainPath AI:**
- Already strong (streaming, citations)
- Add a "Regenerate" button after streaming finishes
- Add confidence score indicator: "Based on X sources, confidence: high/medium/low"

**Talking point:** "I designed defensive UX — streaming with cancel, confidence indicators, regenerate buttons, and citation cards rendered before tokens to build trust."

---

## Pattern 7 — Collect User Feedback (the data flywheel)

**What:** Capture user signals to improve the system over time.

**Key insight:** Every LLM product becomes data-driven eventually. Start collecting on day 1.

**What to collect:**
- 👍 / 👎 on each AI response
- "Why was this bad?" follow-up form
- Time-on-page (did they read the answer?)
- "Was this source helpful?" per citation
- Implicit signals: did they ask a follow-up? regenerate?

**Use cases:**
- A/B test prompts → which version gets more thumbs-up?
- Identify worst-performing queries → improve those specifically
- Build evaluation dataset from user feedback over time
- Eventually: fine-tune a model on the high-rated outputs

**Apply to BrainPath AI:**
- Add 👍 / 👎 buttons after every AI Tutor response
- Save votes to a `Feedback` table with the question + answer
- After 100 votes, look at the worst-rated → analyze patterns
- Week 6 of sprint: tie this into Langfuse dashboard

**Talking point:** "I built a feedback flywheel — every AI response captures thumbs-up/down + reason. After 1000 ratings, I can identify the 10% worst queries and target prompt improvements there."

---

## The 7 patterns in 1 sentence each

1. **Evals** — measure LLM quality with numbers, not vibes
2. **RAG** — retrieve docs at query time instead of fine-tuning
3. **Fine-tuning** — last resort, save for senior-level use cases
4. **Caching** — easy 30-50% cost win, do this first
5. **Guardrails** — validate outputs, don't trust LLMs blindly
6. **Defensive UX** — design UI for graceful LLM failures
7. **User feedback** — collect data flywheel from day 1

---

## Apply to BrainPath AI — sprint roadmap

What's already in production:
- ✅ RAG (Pattern 2)
- ✅ Defensive UX foundation (Pattern 6) — streaming + citations

What to add (sprint Weeks 3-7):

| Week | Pattern | What to ship |
|---|---|---|
| 3 | RAG upgrade | pgvector migration (improves Pattern 2) |
| 4-5 | Caching | Redis-backed semantic cache for embeddings + LLM responses |
| 6 | Evals | Add Langfuse — track every LLM call, retrieval scores, costs |
| 7 | Guardrails | JSON retry-on-failure, source citation verification |
| 7-8 | User feedback | Thumbs up/down on every AI response, save to DB |

By Week 8: **6 of 7 patterns in production code.** Senior-engineer-level architecture from a junior engineer.

---

## Strongest interview talking point

> "I've shipped RAG and streaming UX in BrainPath AI. The next iteration adds the production patterns from Eugene Yan's framework — evals, caching, guardrails, user feedback flywheel. Each is 1-2 days of work that compounds. By the end I'll have a system that handles real production traffic with cost controls, quality measurement, and a data flywheel."

That sentence in an interview = senior-engineer thinking from a junior.

---

## When to use which pattern (decision flow)

```
LLM output is wrong/inconsistent?
└─ Pattern 1 (Evals) → measure first
└─ Pattern 5 (Guardrails) → validate output

LLM is too slow/expensive?
└─ Pattern 4 (Caching) → first try
└─ Pattern 3 (Fine-tuning) → if all else fails

LLM doesn't know your data?
└─ Pattern 2 (RAG) → first choice
└─ Pattern 3 (Fine-tuning) → if RAG isn't enough

UI feels broken when LLM fails?
└─ Pattern 6 (Defensive UX) → streaming, retries, confidence

Want to improve over time?
└─ Pattern 7 (Feedback) → start collecting day 1
```

---

## Free further learning (legal, no Telegram needed)

After mastering these 7 patterns, the next-level resources:

- **Hamel Husain's blog** (hamel.dev) — practical evals deep dive
- **LangSmith / LangChain docs** — observability + agents
- **Pinecone Learning Center** — RAG advanced patterns (re-ranking, hybrid)
- **Latent Space podcast** — senior engineer interviews
- **Andrej Karpathy YouTube "Zero to Hero"** — internals of how LLMs work

---

## Bottom line

Eugene Yan's article = ~12,000 words. This doc = ~1500 words. Same value, 8x faster to absorb.

**Save this. Reference when designing AI features. Drop the patterns into job applications and interview answers.**
