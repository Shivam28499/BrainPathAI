const { askAI, askAIStream } = require("../services/aiService");
const { ChatHistory, LearningPath, User } = require("../models");

// POST /api/ai/tutor — streams tokens via SSE
const aiTutor = async (req, res) => {
  const send = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const fullResponse = await askAIStream(
      question,
      "You are BrainPath AI Tutor. Explain concepts clearly with examples. Keep answers concise but thorough. Use simple language.",
      (token) => send({ type: "token", text: token })
    );

    await ChatHistory.create({
      userId: req.user.id,
      question,
      aiResponse: fullResponse,
    });

    send({ type: "done" });
    res.end();
  } catch (error) {
    console.error("aiTutor error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
    send({ type: "error", message: error.message });
    res.end();
  }
};

// POST /api/ai/assess-skill
const assessSkill = async (req, res) => {
  try {
    const { answers, topic } = req.body;

    const prompt = `Based on these skill assessment answers for "${topic}":
${JSON.stringify(answers)}

Analyze the student's level and provide:
1. Current skill level (beginner/intermediate/advanced)
2. Strengths
3. Weak areas
4. Recommended learning path with specific topics to study in order

Return as JSON format:
{
  "level": "beginner|intermediate|advanced",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "roadmap": ["Step 1: ...", "Step 2: ...", ...]
}`;

    const response = await askAI(prompt, "You are an expert skill assessor. Return ONLY valid JSON.");

    await LearningPath.upsert({
      userId: req.user.id,
      assessmentData: JSON.stringify({ topic, answers }),
      roadmap: response,
    });

    res.json({ assessment: JSON.parse(response) });
  } catch (error) {
    res.status(500).json({ message: error.message, raw: error });
  }
};

// POST /api/ai/generate-quiz
const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, count = 5 } = req.body;

    const prompt = `Generate ${count} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Return as JSON array:
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A",
    "explanation": "..."
  }
]`;

    const response = await askAI(prompt, "You are a quiz generator. Return ONLY valid JSON array.");
    res.json({ questions: JSON.parse(response) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/evaluate-answers
const evaluateAnswers = async (req, res) => {
  try {
    const { questions, userAnswers } = req.body;

    const prompt = `Evaluate these quiz answers:

Questions and correct answers: ${JSON.stringify(questions)}
Student's answers: ${JSON.stringify(userAnswers)}

Provide:
1. Score (out of 100)
2. For each wrong answer, explain why it's wrong and what the correct answer is
3. Overall feedback and tips

Return as JSON:
{
  "score": 80,
  "results": [
    { "questionIndex": 0, "correct": true, "explanation": "" },
    { "questionIndex": 1, "correct": false, "explanation": "..." }
  ],
  "overallFeedback": "..."
}`;

    const response = await askAI(prompt, "You are a quiz evaluator. Return ONLY valid JSON.");
    res.json({ evaluation: JSON.parse(response) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/generate-notes
const generateNotes = async (req, res) => {
  try {
    const { topic } = req.body;

    const response = await askAI(
      `Create comprehensive study notes for "${topic}". Include:
1. Key concepts with explanations
2. Important points to remember
3. Examples where helpful
4. Summary at the end

Format with clear headings and bullet points.`,
      "You are an expert educator. Create clear, well-structured study notes."
    );

    res.json({ notes: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/generate-flashcards
const generateFlashcards = async (req, res) => {
  try {
    const { topic, count = 10 } = req.body;

    const prompt = `Generate ${count} flashcards for studying "${topic}".

Return as JSON array:
[
  { "front": "Question or term", "back": "Answer or definition" }
]`;

    const response = await askAI(prompt, "You are a flashcard generator. Return ONLY valid JSON array.");
    res.json({ flashcards: JSON.parse(response) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/generate-description
const generateDescription = async (req, res) => {
  try {
    const { title, category, level } = req.body;

    const response = await askAI(
      `Write a professional course description for:
Title: "${title}"
Category: ${category}
Level: ${level}

Include: what students will learn, prerequisites, and who this course is for. Keep it under 200 words.`,
      "You are a professional course copywriter."
    );

    res.json({ description: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/ai/summarize
const summarize = async (req, res) => {
  try {
    const { content } = req.body;

    const response = await askAI(
      `Summarize the following content in simple, easy-to-understand language:\n\n${content}`,
      "You are a content summarizer. Make complex topics simple."
    );

    res.json({ summary: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/ai/chat-history
const getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  aiTutor,
  assessSkill,
  generateQuiz,
  evaluateAnswers,
  generateNotes,
  generateFlashcards,
  generateDescription,
  summarize,
  getChatHistory,
};
