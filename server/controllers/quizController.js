const { Quiz, QuizAttempt, Lesson, User } = require("../models");

// GET /api/quizzes/lesson/:lessonId
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ where: { lessonId: req.params.lessonId } });
    if (!quiz) return res.status(404).json({ message: "No quiz for this lesson" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/quizzes/lesson/:lessonId (instructor)
const createQuiz = async (req, res) => {
  try {
    const { questions, isAiGenerated } = req.body;

    const existing = await Quiz.findOne({ where: { lessonId: req.params.lessonId } });
    if (existing) return res.status(400).json({ message: "Quiz already exists for this lesson" });

    const quiz = await Quiz.create({
      questions: JSON.stringify(questions),
      isAiGenerated: isAiGenerated || false,
      lessonId: req.params.lessonId,
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/quizzes/:quizId/submit
const submitQuiz = async (req, res) => {
  try {
    const { answers, score, aiFeedback } = req.body;

    const attempt = await QuizAttempt.create({
      quizId: req.params.quizId,
      userId: req.user.id,
      answers: JSON.stringify(answers),
      score,
      aiFeedback,
    });

    // Add XP for quiz completion
    const user = await User.findByPk(req.user.id);
    user.xpPoints += Math.round(score * 0.5);
    await user.save();

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/quizzes/:quizId/attempts
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { quizId: req.params.quizId, userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuiz, createQuiz, submitQuiz, getMyAttempts };
