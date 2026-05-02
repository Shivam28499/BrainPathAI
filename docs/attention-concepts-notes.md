# Attention Mechanism — DL6 Notes

Notes from 3Blue1Brown DL6: "Attention in transformers, visually explained". Self-attention is the **single most important concept** in modern LLMs (GPT, Claude, Llama, Gemini all use it).

---

## The 5 core concepts

### 1. What problem does self-attention solve?

For each word, decide **which OTHER words in the sentence carry information relevant to its meaning.**

**Example:**

```
"The cat sat on the mat. It was furry."
```

When processing "**It**", the model needs to figure out that "It" refers to "cat" (not "mat", not "the").

**Self-attention is the math that lets the model figure this out.**

Each token "looks at" every other token and scores how relevant each is. "cat" gets a high attention score from "It"; "the" gets low.

**Lock this in:** Self-attention = "which OTHER words matter for understanding THIS word?"

It's NOT about position (that's positional encoding — separate mechanism). It's about **context relationships**.

---

### 2. Q, K, V — the heart of attention ⭐

For each token, the model creates **3 different vectors** by multiplying the token's embedding with 3 learned weight matrices (Wq, Wk, Wv).

#### Library analogy

Imagine searching a library:

| Vector        | Role                                     | Library equivalent                                              |
| ------------- | ---------------------------------------- | --------------------------------------------------------------- |
| **Query (Q)** | "What am I looking for?"                 | "I want books about cats"                                       |
| **Key (K)**   | "What am I about?"                       | Each book has a label: "I am about cats" / "I am about finance" |
| **Value (V)** | "What info do I provide if you pick me?" | The actual content of the book                                  |

#### In transformer math

For each token in the sentence:

```
Q vector = token_embedding × Wq    (what context am I looking for?)
K vector = token_embedding × Wk    (what context can I provide?)
V vector = token_embedding × Wv    (what info will I share if matched?)
```

Wq, Wk, Wv are **learned** during training — billions of parameter updates teach them what to encode.

**Lock this in:** Q = searcher. K = announcer. V = content giver.

---

### 3. How attention is calculated — the 4 steps

Now you have Q, K, V vectors for every token. Here's how attention happens:

#### Step 1: Compute attention scores via dot product

For each pair of tokens (A, B):

```
attention_score(A → B) = Q(A) · K(B)
```

**The dot product is between Q and K** — NOT V.

If Q(A) and K(B) point in similar directions (high cosine similarity), the dot product is large → "A should pay attention to B."

#### Step 2: Apply softmax

Raw dot products can be any number. Softmax normalizes them so they sum to 1.0:

```
attention_weights(A) = softmax([score(A→1), score(A→2), score(A→3), ...])
```

Now you have a "probability distribution" over all other tokens. Each weight says "this is how much A should pay attention to that token."

#### Step 3: Weighted sum of V vectors

Use those attention weights to combine the V vectors of all tokens:

```
new_meaning(A) = sum over all tokens i: attention_weight(A→i) × V(i)
```

The token's new representation is a **weighted average** of all tokens' value vectors.

#### Step 4: Pass to next layer

This new representation becomes the input for the next layer (where another attention round happens with new Q, K, V).

**Why this works:** through training, the model learns Wq, Wk, Wv such that semantically related tokens have similar Q-K alignment, and the V vectors carry useful info to share.

---

### 4. Multi-head attention — why multiple heads?

Single attention computes ONE pattern of relationships. **Multi-head attention computes MANY patterns in parallel.**

#### Why parallel heads?

Different heads learn different relationship types:

| Head   | Specialization (example)                           |
| ------ | -------------------------------------------------- |
| Head 1 | Subject-verb agreement ("cats ARE", not "cats IS") |
| Head 2 | Pronoun resolution ("it" → "cat")                  |
| Head 3 | Adjective-noun binding ("furry" → "cat")           |
| Head 4 | Sentence-level structure (subject vs object)       |
| Head 5 | Long-distance dependencies                         |
| ...    | ...                                                |

The model never explicitly tells heads what to specialize in. They self-organize during training.

#### Sizes in real models

| Model       | Heads per layer | Total layers |
| ----------- | --------------- | ------------ |
| GPT-2 small | 12              | 12           |
| GPT-3       | 96              | 96           |
| Llama-3-70B | 64              | 80           |

That's thousands of attention "computations" per token. **Massively parallel pattern matching.**

**Lock this in:** Multi-head = many specialized attention patterns running simultaneously.

---

### 5. Masked attention — preventing "cheating"

During training, the model sees the **whole sentence** at once. But during generation, it produces tokens one at a time and should only use what's been generated so far.

**The mask** prevents the model from peeking at future tokens.

#### Example

```
Training input: "The cat sat on the mat"

When training position 4 ("on"):
- CAN attend to: "The", "cat", "sat", "on" (past + self)
- CANNOT attend to: "the", "mat" (future) → MASKED

When training position 5 ("the"):
- CAN attend to: "The", "cat", "sat", "on", "the"
- CANNOT attend to: "mat" → MASKED
```

#### How masking is implemented

Before softmax, **set future-token scores to negative infinity (−∞)**:

```
attention_scores = [
  [score, -inf, -inf, -inf, -inf, -inf],   ← position 0 (can only see itself)
  [score, score, -inf, -inf, -inf, -inf],  ← position 1 (sees 0, 1)
  [score, score, score, -inf, -inf, -inf], ← position 2 (sees 0-2)
  ...
]
```

Then softmax turns those `−∞` into **0** → fully masked.

**Lock this in:** Mask = ignore future tokens during training, so the model learns to predict from past context only.

---

## Visual: full attention flow

```
Sentence: "The cat sat"

For each token, project to Q, K, V:
  "The"  → Q1, K1, V1
  "cat"  → Q2, K2, V2
  "sat"  → Q3, K3, V3

Compute attention scores (with masking applied):

         "The"   "cat"   "sat"
"The"  [  Q1·K1   -inf    -inf  ]   ← only sees self
"cat"  [  Q2·K1   Q2·K2   -inf  ]   ← sees "The" and self
"sat"  [  Q3·K1   Q3·K2   Q3·K3 ]   ← sees all past + self

Apply softmax row-wise (probabilities):

         "The"   "cat"   "sat"
"The"  [  1.0    0.0     0.0  ]
"cat"  [  0.3    0.7     0.0  ]   ← attends 30% to "The", 70% to itself
"sat"  [  0.1    0.6     0.3  ]   ← attends most to "cat" (subject)

Multiply by V vectors and sum:

new "sat" representation = 0.1·V1 + 0.6·V2 + 0.3·V3
```

That's one attention head. Multi-head runs many of these in parallel.

---

## Connection to BrainPath AI

You might think: "I don't write transformers. Why does this matter?"

Because **attention is happening every time you call Groq's API**:

| Concept              | Where it appears in your work                                                 |
| -------------------- | ----------------------------------------------------------------------------- |
| Self-attention       | Every Llama-3.3-70B call uses 64 heads × 80 layers of self-attention          |
| Q · K dot product    | This is what makes Llama "understand" your prompt                             |
| Multi-head attention | Why Llama can handle complex multi-paragraph prompts (e.g., your RAG context) |
| Masked attention     | Why streaming works token-by-token (each new token only sees past tokens)     |
| Softmax              | Used both for attention weights AND final next-token sampling                 |

Knowing this:

- **You can write better prompts** (you understand WHY the LLM weights certain words more)
- **You can debug bad outputs** (long context = attention spreads thin)
- **You can explain to clients/interviewers** WHY GPT does what it does

---

## Self-test — try in 1 week without notes

1. What problem does self-attention solve? (1 sentence)
2. What are Q, K, V? Use the library analogy.
3. Walk through the 4 steps of computing attention for one token.
4. Why multi-head instead of single attention?
5. What does masking do? Why is it needed?
6. (Bonus) What math operation converts attention scores to probabilities?

If you can answer all 6 → DL6 mastered. You now understand the heart of every modern LLM.

---

## Common interview questions this prepares you for

- "Explain how a transformer works" → use this doc
- "What's the difference between encoder and decoder attention?" → masking is the difference
- "Why are LLMs so good at long-range dependencies?" → multi-head + many layers
- "What is the bottleneck in scaling transformers?" → attention is O(N²) in sequence length

---

## Source

- 3Blue1Brown DL6: "Attention in transformers, visually explained"
- Channel: 3Blue1Brown
- Posted: April 2024
- ~26 minutes
- **Most important AI video on the internet** for understanding modern LLMs

---

## Next: DL7 (How might LLMs store facts) — optional

DL7 covers the MLP/feedforward layers between attention layers. Worth watching but not as critical as DL5/DL6.

For deeper understanding:

- Jay Alammar **"The Illustrated Transformer"** — same content with beautiful diagrams
- Andrej Karpathy **"Let's build GPT from scratch"** — code-level (Python, harder for JS dev)
