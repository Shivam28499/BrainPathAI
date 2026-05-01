# Transformer Concepts — DL5 Notes

Notes from 3Blue1Brown DL5: "But what is a GPT?". Reference these whenever you forget the basics.

---

## The 5 core concepts

### 1. What does GPT do?

**GPT predicts the next token in a sequence.**

That's it. The whole game.

- Given input → outputs the most likely next word
- Feeds it back → predicts again
- Continues until done

Everything else (transformers, layers, weights, attention) is just HOW it does this.

**Lock this in:** GPT = next-token predictor.

---

### 2. What is a token?

A **token is the smallest unit GPT processes.**

- Usually a SUB-word piece, sometimes a whole word
- Each token has a numeric ID

**Examples:**
| Text | Tokens | Token IDs |
|---|---|---|
| `cat` | `[cat]` | `[4937]` |
| `unbelievable` | `[un, believ, able]` | `[346, 17234, 540]` |
| `I love cats` | `[I, love, cats]` | `[40, 1842, 4937]` |

**Vocabulary size:**
- GPT-2: ~50,000 tokens
- GPT-3/4: ~100,000 tokens
- Llama-3: ~128,000 tokens

**Key insight:** "1 word = 1 token" is FALSE. Long/rare words split into multiple tokens. This is why API costs differ from word counts.

---

### 3. What is an embedding?

An **embedding is a LIST of numbers (a vector) that represents the MEANING of a token or text.**

- Vector = 1D list of numbers
- NOT a matrix (matrix = 2D grid)
- Each token gets its own vector
- Similar meanings → similar vectors

**Sizes:**
- MiniLM (BrainPath AI uses): 384 dimensions
- Word2Vec: 300 dimensions
- GPT-3: 12,288 dimensions
- OpenAI text-embedding-3-large: 3,072 dimensions

**Example:**
```
"cat"  → [0.034, -0.121, 0.087, ...] (384 numbers)
"kitten" → [0.041, -0.118, 0.082, ...] (similar! both about felines)
"finance" → [0.5, 0.2, -0.3, ...] (very different)
```

**Lock this in:** Embedding = VECTOR (not matrix). Position in space = meaning.

---

### 4. The "king − man + woman ≈ queen" insight ⭐

This is the SINGLE most mind-blowing insight about embeddings.

**It proves that semantic relationships are encoded as DIRECTIONS in the embedding space.**

```
DIRECTION from "man" to "king" = "royalty added"
DIRECTION from "woman" to "queen" = same "royalty" direction
```

**You can do MATH on words.**

More examples:
- `Paris − France + Italy ≈ Rome` (the "capital of" direction)
- `walk − walked + ran ≈ run` (the "past tense" direction)
- `dog − puppy + cat ≈ kitten` (the "young animal" direction)

**Why this matters:**
- The model wasn't told these relationships
- It LEARNED them from billions of sentences
- Geometry of the space encodes ALL semantic relationships
- This is why embedding-based search works

**Lock this in:** Words = points in space. Directions = relationships. Math on words = real.

---

### 5. How does GPT pick the next word?

**GPT outputs a probability distribution over its entire vocabulary, then samples from it.**

Step by step:
1. **Run input through transformer layers** → produces final hidden state
2. **Run through "unembedding" layer** → produces a SCORE (logit) for every word in vocab (~50,000 numbers)
3. **Apply SOFTMAX** → converts logits to probabilities that sum to 1.0
4. **Sample from distribution** based on temperature setting

**Temperature controls randomness:**
- **Temperature 0:** always pick highest-probability word (deterministic, boring)
- **Temperature 0.7:** some randomness — sometimes picks 2nd or 3rd highest (creative, default for chat)
- **Temperature 1.5:** lots of randomness, often weird/nonsensical
- **Temperature 2+:** total chaos

**In BrainPath AI:**
Your `aiService.js` uses `temperature: 0.7` — that's why your AI Tutor sounds creative, not robotic.

**Lock this in:** Softmax converts scores → probabilities. Temperature controls how random the sampling is.

---

## Connecting to BrainPath AI

| Concept | Where it appears in your code |
|---|---|
| Tokens | When you call Groq API — `max_tokens: 2048` limits how many output tokens |
| Embeddings | `ragService.js` — MiniLM produces 384-dim vectors for chunks |
| Vector arithmetic | Cosine similarity in `findTopK` — measures the angle between vectors |
| Softmax | Inside Groq's API (you don't see it, but it's there for every token) |
| Temperature | `aiService.js` line 13 + 32 — set to 0.7 |

You've been USING these concepts. Now you UNDERSTAND them.

---

## What you didn't see in DL5 (covered in DL6 next)

The video explains transformer at high level but skips the heart of it: **self-attention**. That's DL6.

**Self-attention answer this question:** When predicting the next word, which previous words should the model "pay attention to"?

Example: "The cat sat on the ___"
- The model should pay attention to "cat" (subject) and "sat" (action context)
- Less attention to "the" (filler word)
- Self-attention is the math that decides this

DL6 explains this in detail. Watch next.

---

## Self-test — ask yourself in 1 week

Cover the answers above and try to answer:

1. Plain English: what does GPT do?
2. Are tokens always full words?
3. Vector or matrix? (the embedding)
4. What does `king - man + woman ≈ queen` prove?
5. What converts logits to probabilities?
6. What controls randomness in output?

If you can answer all 6 → DL5 mastered. Move on.

---

## Source

- 3Blue1Brown DL5: "But what is a GPT? Visual intro to Transformers"
- Channel: 3Blue1Brown
- Posted: April 2024
- ~26 minutes

For DL6 (Attention) and Jay Alammar's Illustrated Transformer for further depth.
