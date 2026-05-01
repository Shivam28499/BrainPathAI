---
name: 8-week AI learning roadmap
description: Daily AI block plan (30 min read + 90 min code). Started 2026-04-28. Each day = specific reading + specific build task. Tied to BrainPath AI.
type: reference
originSessionId: 70e7df9d-ce4f-48fe-ac01-c9ec7e29f719
---
**Format:** Each day = 30 min read/watch + 90 min code. Total 2 hr daily AI block.

**Sources used (all free, all legal):**
- 3Blue1Brown YouTube — visual transformer videos
- Anthropic Prompt Engineering Guide
- Eugene Yan blog (eugeneyan.com)
- Hamel Husain blog (hamel.dev)
- Pinecone Learning Center
- Jay Alammar Illustrated Transformer
- LangChain JS docs

---

# WEEK 1 (Apr 28 – May 4) — FOUNDATIONS

**Theme:** Understand what LLMs actually do internally + master prompt engineering basics.
**End-of-week deliverable:** Apply 4 prompt patterns to BrainPath AI (sharper aiTutor, few-shot in generateQuiz, XML in askDocument, prefill in flashcards).

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | 3Blue1Brown **DL5: "But what is a GPT?"** (YouTube, 26 min) | Sharpen `aiTutor` system prompt (Pattern 1) |
| Tue | 3Blue1Brown **DL6: "Attention in transformers"** (26 min) | Add few-shot examples to `generateQuiz` (Pattern 2) |
| Wed | Jay Alammar **"Illustrated Transformer"** (jalammar.github.io/illustrated-transformer/) | XML-tag the RAG prompt in `askDocument` (Pattern 4) |
| Thu | Anthropic Prompt Engineering Guide — sections you haven't read | Prefill JSON output in `generateFlashcards` (Pattern 5) |
| Fri | 3Blue1Brown **DL7: "How might LLMs store facts"** | Add Chain-of-Thought to `assessSkill` (Pattern 3) |
| Sat | Read your own `BrainPathAI/docs/prompt-engineering-patterns.md` (review) | Catch up day — fix any earlier task |
| Sun | Rest / light review | Rest |

---

# WEEK 2 (May 5 – May 11) — PROMPT ENGINEERING MASTERY

**Theme:** Build a real feature from scratch using all prompt patterns.
**End-of-week deliverable:** **Resume Parser feature** in BrainPath AI — paste resume text, AI extracts structured JSON `{name, email, skills[], experience[]}` with retry-on-failure.

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | OpenAI Cookbook **"Structured Outputs Intro"** (cookbook.openai.com) | Design Resume Parser prompt — system + user + 3 few-shot examples |
| Tue | Read **Hamel Husain on evals** (hamel.dev/blog) | Create `/api/resume/parse` endpoint, write Zod schema for output |
| Wed | Anthropic guide on **structured outputs + JSON mode** | Implement parsing logic + JSON.parse retry-on-error pattern |
| Thu | OpenAI Cookbook **"Function calling"** chapter | Add Resume Parser UI page to BrainPath AI client |
| Fri | Hamel: **"How to evaluate your LLM"** | Test Resume Parser with 5 real resumes, log failures, iterate prompts |
| Sat | Read **eugeneyan.com on evals** | Ship + commit + Dev.to draft about Resume Parser pattern |
| Sun | Rest | Rest |

---

# WEEK 3 (May 12 – May 18) — RAG DEEP DIVE + pgvector MIGRATION

**Theme:** Upgrade BrainPath AI from JSON-in-TEXT to pgvector. Learn hybrid search.
**End-of-week deliverable:** BrainPath AI v2 with pgvector + HNSW index. Dev.to blog post about the migration.

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | Pinecone Learning Center **"Embeddings"** + **"Vector Databases"** | Add pgvector extension to Render Postgres, add `embedding_vec VECTOR(384)` column |
| Tue | LangChain RAG tutorial — chunking strategies | Write migration script: parse JSON embeddings → insert into vector column |
| Wed | Read **eugeneyan.com on RAG** (full article re-read) | Create HNSW index on the new column, benchmark query speed before/after |
| Thu | Pinecone **"Hybrid Search"** + **"Re-ranking"** articles | Add BM25 lexical search via Postgres `tsvector`/`ts_rank_cd` |
| Fri | LangChain JS RAG examples (js.langchain.com) | Combine BM25 + cosine similarity → hybrid `findTopK` function |
| Sat | Review your `BrainPathAI/docs/internals.md` — update pgvector section | Write Dev.to post: "Migrating RAG from JSON-in-TEXT to pgvector" |
| Sun | Rest | Rest |

---

# WEEK 4 (May 19 – May 25) — TANSTACK QUERY + AI APP UX

**Theme:** Modern React data fetching. Apply to BrainPath AI client.
**End-of-week deliverable:** BrainPath AI client refactored to TanStack Query. No more `axios + useEffect`.

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | TanStack Query **"Overview" + "Quick Start"** (tanstack.com/query) | Install TanStack Query in BrainPath AI client, set up provider |
| Tue | TanStack Query **"useQuery"** docs deep dive | Refactor `Documents.js` to useQuery (replace useEffect) |
| Wed | TanStack Query **"useMutation"** | Refactor PDF upload to useMutation with optimistic updates |
| Thu | TanStack Query **"Caching"** + **"Stale time"** | Tune cache settings — chunks query every 60s, docs list every 5s |
| Fri | TanStack Query **"Infinite Queries"** | Add infinite scroll to documents list (if 10+ docs) |
| Sat | Vercel AI SDK docs (sdk.vercel.ai) — comparison | Catch up day — fix any broken refactors |
| Sun | Rest | Rest |

---

# WEEK 5 (May 26 – Jun 1) — STATE + FORMS + AGENTS INTRO

**Theme:** Zustand for state, React Hook Form + Zod for forms. First agent feature.
**End-of-week deliverable:** BrainPath AI auth refactored to Zustand. 2 forms refactored to RHF + Zod. First agent feature shipped.

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | Zustand **docs** (github.com/pmndrs/zustand) | Replace AuthContext with Zustand store |
| Tue | React Hook Form **docs** + Zod tutorial | Refactor login/register forms to RHF + Zod schemas |
| Wed | Anthropic **"Building Effective Agents"** article | Read deeply, take notes — agents are the future |
| Thu | LangChain JS **"Agents" tutorial** | Design first agent: "Multi-step reasoning quiz generator" |
| Fri | LangGraph JS docs | Implement basic ReAct loop in BrainPath AI for the agentic quiz feature |
| Sat | Andrej Karpathy interview/blog on agents | Test + ship the agent feature |
| Sun | Rest | Rest |

---

# WEEK 6 (Jun 2 – Jun 8) — EVALS + OBSERVABILITY

**Theme:** Production AI requires measurement. Add Langfuse to BrainPath AI.
**End-of-week deliverable:** Langfuse dashboard tracking every LLM call cost, retrieval quality, user feedback.

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | Langfuse **docs** (langfuse.com) | Install Langfuse SDK, set up project, instrument first LLM call |
| Tue | Hamel Husain **"How I evaluate my LLM"** | Add eval scoring to `findTopK` retrieval — log score histograms |
| Wed | RAGAS docs (docs.ragas.io) | Implement faithfulness eval — does answer cite real chunks? |
| Thu | Read your `BrainPathAI/docs/llm-production-patterns.md` (Pattern 1: Evals) | Build `/admin/ai-stats` page showing cost per user, query volume |
| Fri | Read on **A/B testing prompts** (any blog) | Add prompt version tracking — log which version generated each output |
| Sat | Polish + screenshot the dashboard for portfolio | Commit + push + Dev.to draft on observability |
| Sun | Rest | Rest |

---

# WEEK 7 (Jun 9 – Jun 15) — GUARDRAILS + CACHING + USER FEEDBACK

**Theme:** Production hardening. The 3 patterns most engineers skip.
**End-of-week deliverable:** Semantic cache, JSON retry, citation verification, thumbs up/down feedback in BrainPath AI.

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | `llm-production-patterns.md` Pattern 4 (Caching) | Build in-memory semantic cache — if query similar to recent (>0.95 cosine), serve cached |
| Tue | Anthropic **"Prompt caching"** docs | Move semantic cache to Redis (Render Redis or Upstash) |
| Wed | `llm-production-patterns.md` Pattern 5 (Guardrails) | Add JSON retry-on-failure to `generateQuiz` and `generateFlashcards` |
| Thu | Read on **prompt injection defense** | Add citation verification — does each `[Source N]` map to a real chunk? |
| Fri | `llm-production-patterns.md` Pattern 7 (User feedback) | Add 👍/👎 buttons after AI Tutor responses, save to `Feedback` table |
| Sat | Read all 3 of your own `docs/` files for review | Write Dev.to blog post on production AI hardening |
| Sun | Rest | Rest |

---

# WEEK 8 (Jun 16 – Jun 20) — POLISH + INTERVIEW PREP + APPLY VOLUME

**Theme:** Ship final polish, ramp applications, prepare for interviews.
**End-of-week deliverable:** Polished BrainPath AI v3, 100+ applications sent total, 3 mock interviews completed.

| Day | 30-min Read/Watch | 90-min Build |
|---|---|---|
| Mon | Re-read `BrainPathAI/docs/internals.md` (mock interview prep) | UI polish: mobile responsiveness, loading states, error UX |
| Tue | System design articles for AI apps | Add custom domain to BrainPath AI (Vercel custom domain) |
| Wed | Re-read all your Dev.to posts (refine if needed) | Add testing basics — Jest + RTL for 5 critical components |
| Thu | Mock interview with Claude (paste 5 questions, answer aloud) | Extract 3 custom hooks from BrainPath AI (`useAuth`, `useStreamingChat`, `useDocuments`) |
| Fri | Read Latent Space podcast transcripts (latent.space) | Final commit + push + version BrainPath AI as v3 |
| Sat | Practice STAR-format behavioral answers | Submit 20+ applications across LinkedIn + Wellfound |
| Sun | Rest + reflect on 8-week sprint | Rest |

---

# Daily ritual (every weekday)

```
Morning:
☐ AI block: 30 min read + 90 min code (today's curriculum item)
☐ Apply: 5-10 jobs (multi-country: SG/UAE/UK/DE/NL/CA filter)

Afternoon/Evening:
☐ React + Tailwind: 1 hr (rotate React advanced / Tailwind rebuild)
☐ Interview prep: 30 min (rotate active recall / mock / system design)
☐ English speaking: 30 min (combine with interview or AI verbalization)

Total active: ~4.75 hr/day outside Cognigenai.
```

---

# Backup resources (when stuck or need variety)

**YouTube channels:**
- 3Blue1Brown — math + transformers (visual)
- StatQuest — friendly explanations (no math heavy)
- Latent Space — senior AI engineer interviews
- Two Minute Papers — daily AI research
- Yannic Kilcher — paper deep dives (advanced)

**Blogs/sites:**
- eugeneyan.com — production AI engineering
- hamel.dev — evals + observability
- jalammar.github.io — illustrated explanations
- pinecone.io/learn — RAG/vector DB
- huggingface.co/learn — courses on transformers
- anthropic.com/research — frontier lab perspectives
- oai.cookbook — OpenAI practical recipes

**Free courses (no payment):**
- DeepLearning.AI Short Courses (free) — agents, LangChain, RAG
- Hugging Face NLP Course (free)
- Fast.ai Practical Deep Learning (free)
- CS50 AI (free, Harvard)

**Avoid (for now):**
- Karpathy's videos (Python heavy, friction for JS dev)
- Stanford CS229 (too theoretical for practitioner)
- Random Udemy courses (often outdated)
- Pirated Telegram courses (illegal, often outdated 2022/2023 content)

---

# How to use this roadmap

1. Every morning, check the day in the table above
2. Follow the 30-min read + 90-min code split
3. If you finish early, work on backlog (Loom demo, Tailwind rebuilds, applications)
4. Don't skip ahead — concepts build on each other
5. Don't go too deep — 30 min reading is the cap, no rabbit holes

**Critical rule:** if a day's resource is unavailable or boring, switch to the same week's theme using a different resource from the backup list. Don't get stuck.

---

# Mid-week check-ins (every Wednesday and Saturday)

Ask Claude:
- "Am I on track with Week N?"
- "Quiz me on this week's concepts"
- "I'm stuck on [specific thing]"

Claude has memory — knows where you should be. Don't drift.

---

# End-of-sprint outcome (target by Jun 20, 2026)

By Week 8 end, Shivam should:
- ✅ Built BrainPath AI v3 with pgvector, TanStack Query, Zustand, RHF+Zod, agents, evals, caching, guardrails, feedback
- ✅ 8 features in production representing the 7 LLM patterns from Eugene Yan
- ✅ 4-6 Dev.to blog posts published (each from a sprint week)
- ✅ Loom demo + LinkedIn announcement live
- ✅ 100+ applications sent
- ✅ 3+ mock interviews completed
- ✅ Strong English fluency on technical topics
- ✅ Solid React advanced + Tailwind production-grade
- ✅ Realistic shot at first international remote contract at $25-40/hr
