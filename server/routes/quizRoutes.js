const express = require("express");
const router = express.Router();
const { getQuiz, createQuiz, submitQuiz, getMyAttempts } = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/auth");

router.get("/lesson/:lessonId", protect, getQuiz);
router.post("/lesson/:lessonId", protect, authorize("instructor"), createQuiz);
router.post("/:quizId/submit", protect, submitQuiz);
router.get("/:quizId/attempts", protect, getMyAttempts);

module.exports = router;
