const express = require("express");
const router = express.Router();
const {
  aiTutor,
  assessSkill,
  generateQuiz,
  evaluateAnswers,
  generateNotes,
  generateFlashcards,
  generateDescription,
  summarize,
  getChatHistory,
} = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/auth");

router.post("/tutor", protect, aiTutor);
router.post("/assess-skill", protect, assessSkill);
router.post("/generate-quiz", protect, generateQuiz);
router.post("/evaluate-answers", protect, evaluateAnswers);
router.post("/generate-notes", protect, generateNotes);
router.post("/generate-flashcards", protect, generateFlashcards);
router.post("/generate-description", protect, authorize("instructor"), generateDescription);
router.post("/summarize", protect, summarize);
router.get("/chat-history", protect, getChatHistory);

module.exports = router;
