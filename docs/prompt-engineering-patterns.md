# Prompt Engineering — The 6 Patterns That Matter

> Distilled from Anthropic's Prompt Engineering Guide. Tactical, applicable, and tied directly to BrainPath AI features.

---

## Quick reference

```
┌────────────────────────────────────────────┐
│ THE 6 PROMPT PATTERNS                      │
├────────────────────────────────────────────┤
│ 1. Be Clear and Direct                     │
│ 2. Few-Shot Examples (multishot)           │
│ 3. Chain of Thought (CoT)                  │
│ 4. XML Tags for Structure                  │
│ 5. Output Format Control (prefill)         │
│ 6. System vs User Messages                 │
└────────────────────────────────────────────┘
```

---

## Pattern 1 — Be Clear and Direct

LLMs aren't mind-readers. **Specific instructions = specific outputs.**

### Vague (what most devs write)

```
Summarize this article.
```

### Specific (what works)

```
Summarize this article in exactly 3 bullet points.
Each bullet should be under 20 words.
Focus on actionable insights, not background context.
Use the format: "• [insight]"
```

### When to use

- Always. Every prompt.

### Apply to BrainPath AI

Current `aiTutor` system prompt:

```
You are BrainPath AI Tutor. Explain concepts clearly with examples...
```

Sharper:

```
You are BrainPath AI Tutor. Answer in 3 paragraphs max:
1. Direct answer (2-3 sentences)
2. Concrete example (code or analogy)
3. Common pitfall to avoid

Use simple language. No marketing speak. If you don't know, say so.
```

Specificity = better answers + less rambling = lower cost.

---

## Pattern 2 — Few-Shot Examples (multishot prompting)

**Show the LLM 2-3 examples of input → output, then ask for a new one.** Most powerful technique for structured outputs.

### Why it works

LLMs pattern-match. 1 example = ambiguous. 2-3 examples = clear pattern. Especially critical for structured JSON outputs.

### Example for resume parser (Week 2 project)

```
Extract structured data from resumes. Examples:

INPUT: "Jane Doe, 5 years at Google as Senior Engineer, expert in Python and Go..."
OUTPUT: {"name": "Jane Doe", "years": 5, "current_role": "Senior Engineer", "current_company": "Google", "skills": ["Python", "Go"]}

INPUT: "John Smith, recently graduated from MIT, did internship at Apple..."
OUTPUT: {"name": "John Smith", "years": 0, "current_role": "Intern", "current_company": "Apple", "skills": []}

INPUT: "{user's actual resume}"
OUTPUT:
```

The LLM learns the schema from examples. **JSON output reliability jumps from ~60% to ~95%.**

### When to use

- Any structured output (JSON, lists, tables)
- Edge cases you want handled consistently
- Domain-specific formatting (medical, legal)

### Apply to BrainPath AI

Current `generateQuiz`:

```js
const prompt = `Generate ${count} multiple choice questions about "${topic}"...
Return as JSON array:
[
  { "question": "...", "options": ["A) ...", ...], ... }
]`;
```

Better with examples:

```js
const prompt = `Generate quiz questions. Examples:

Topic: React, Difficulty: Beginner
Output: [
  { "question": "What is JSX?", "options": ["A) JavaScript XML syntax extension", "B) JSON syntax", "C) JavaScript Style Extension", "D) Java Syntax"], "correctAnswer": "A", "explanation": "JSX lets you write HTML-like syntax in JavaScript files." }
]

Topic: ${topic}, Difficulty: ${difficulty}
Output:`;
```

The LLM now has a concrete pattern to follow. Output reliability improves dramatically.

---

## Pattern 3 — Chain of Thought (CoT)

For complex reasoning tasks, **tell the LLM to think step-by-step before answering.**

### Magic phrase

Add to your prompt:

```
Think step-by-step before answering. Show your reasoning.
```

Or even better:

```
Before giving the final answer, briefly outline:
1. What's being asked
2. Key facts/constraints
3. Your reasoning
4. Final answer
```

### Why it works

LLMs are next-token predictors. Forcing them to "show work" makes the final answer dramatically more accurate on complex tasks (math, multi-step reasoning, debugging).

**Performance jump:** ~30% accuracy improvement on hard problems vs no CoT.

### When to use

- Multi-step math/logic
- Code debugging
- Decision-making with tradeoffs
- Anything requiring "why"

### When NOT to use

- Simple single-step tasks (just adds noise)
- Latency-sensitive UX (CoT = slower response)

### Apply to BrainPath AI

`assessSkill` analyzes student answers. Add CoT:

```
You are an expert skill assessor. Before giving the JSON output:

1. Note which questions student got right vs wrong
2. Identify the underlying concepts they're missing
3. Group their weaknesses into 2-3 themes
4. Then output the JSON

Final output (JSON only, no commentary):
{ "level": ..., "strengths": [...], ... }
```

This makes the assessment thoughtful, not pattern-matching.

---

## Pattern 4 — XML Tags for Structure

**Wrap inputs in XML tags** to clearly separate different parts of your prompt.

### Why it works

LLMs trained on Anthropic data heavily use XML tags as structural anchors. They reliably treat XML-tagged content as "data to process" vs "instructions."

### Example

```
You are a code reviewer. Analyze the code in <code> tags 
and provide feedback in <feedback> tags.

<code>
function add(a, b) {
  return a + b
}
</code>

<feedback>
```

The LLM completes inside `<feedback>...</feedback>` and ignores the structural tags. Clean separation = better behavior.

### Common tags

- `<context>...</context>` — background info
- `<example>...</example>` — few-shot examples
- `<input>...</input>` — user data
- `<output_format>...</output_format>` — expected response shape
- `<rules>...</rules>` — constraints

### Apply to BrainPath AI

Current RAG prompt:

```js
const userPrompt = `Sources from the document "${doc.title}":

${context}

Question: ${question}

Answer:`;
```

XML version:

```js
const userPrompt = `<task>
Answer the user's question using ONLY the provided sources. Cite sources inline like [Source 1].
</task>

<sources>
${context}
</sources>

<question>${question}</question>

<answer>`;
```

The LLM treats sources as data, question as the actual ask. Less confusion, more grounded answers.

---

## Pattern 5 — Output Format Control (prefill)

**Tell the LLM exactly how to format the response.** End your prompt with the start of the expected output.

### Technique 1: Prefill the response

```
Answer in this exact format:

{
  "answer": "
```

By starting the JSON for the LLM, it can ONLY continue the JSON. No commentary, no markdown wrappers. Massive reliability boost.

### Technique 2: Explicit format spec

```
Format your response as:

ANSWER: [1-2 sentence direct answer]
CONFIDENCE: [low/medium/high]
SOURCES: [comma-separated source numbers]
```

The LLM follows this structure 95%+ of the time.

### Apply to BrainPath AI

For `generateQuiz`, prevent markdown-wrapped JSON:

```js
const prompt = `Generate ${count} questions...

Respond with ONLY the JSON array, no markdown code fences, no explanation.

Start your response with [ and end with ].

[`;
```

The trailing `[` forces JSON-only output.

---

## Pattern 6 — System vs User Messages

**System message:** AI's identity + behavior rules. Persistent.
**User message:** The actual task. Changes per request.

### Anti-pattern

Putting everything in the user message:

```js
{ role: "user", content: "You are a helpful assistant. Respond in JSON. Now translate: hello" }
```

### Best practice

Split them:

```js
{ role: "system", content: "You are a translation expert. Always respond with JSON in the format {\"translation\": \"...\"}. No commentary." }
{ role: "user", content: "Translate: hello" }
```

### Why it matters

- System messages are **harder to override** by user injection (security)
- Cleaner separation = the AI behaves more predictably
- You can change tasks without rewriting persona

### Apply to BrainPath AI

Already correctly done in `aiTutor`:

```js
{ role: "system", content: "You are BrainPath AI Tutor. ..." }
{ role: "user", content: question }
```

Make sure all AI endpoints follow this pattern.

---

## What to skip (for now)

For junior MERN+AI engineers, defer these:

- **Tool use / Function calling** — Week 4-5 sprint
- **Vision / Multimodal** — when adding image features
- **Prompt caching** — high-volume production scale only
- **Long context tips** — RAG already handles this differently
- **Citations API** — Anthropic-specific (you're on Groq)

All useful eventually, just not now.

---

## Action items (apply this week)

| # | Task | File to update | Time |
|---|---|---|---|
| 1 | Sharper system prompt for `aiTutor` | `server/controllers/aiController.js` line 24 | 10 min |
| 2 | Add few-shot examples to `generateQuiz` | `server/controllers/aiController.js` line 87 | 20 min |
| 3 | XML-tag the RAG prompt in `askDocument` | `server/controllers/documentController.js` line 178 | 15 min |
| 4 | Prefill JSON output in all structured-output prompts | Multiple files | 30 min |

**Easiest win:** #1 (sharper system prompt). 10 min, immediate quality improvement.

---

## Mental model — when to use which pattern

| Goal | Pattern to use |
|---|---|
| Get cleaner, less rambling output | 1 (Be Direct) |
| Get reliable JSON output | 2 (Few-Shot) + 5 (Prefill) |
| Solve complex multi-step problems | 3 (CoT) |
| Separate data from instructions | 4 (XML Tags) |
| Force a specific response format | 5 (Prefill) |
| Define AI persona vs task | 6 (System vs User) |

Most production prompts use **3-4 patterns combined** for max reliability.

---

## Source

Distilled from [Anthropic's Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview). Read the full guide later when scaling to advanced topics (tools, vision, caching).
