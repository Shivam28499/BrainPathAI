const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const askAI = async (prompt, systemPrompt = "You are a helpful educational AI assistant.") => {
  const result = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2048,
  });
  return result.choices[0].message.content;
};

// Stream tokens as they arrive. `onToken(text)` is called for each delta.
// Returns the full concatenated answer when done.
const askAIStream = async (
  prompt,
  systemPrompt = "You are a helpful educational AI assistant.",
  onToken = () => {}
) => {
  const stream = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  let fullText = "";
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content || "";
    if (delta) {
      fullText += delta;
      onToken(delta);
    }
  }
  return fullText;
};

module.exports = { askAI, askAIStream };
