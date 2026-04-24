const express = require("express");
const router = express.Router();
const { getLessons, createLesson, updateLesson, deleteLesson } = require("../controllers/lessonController");
const { protect, authorize } = require("../middleware/auth");

router.get("/course/:courseId", getLessons);
router.post("/course/:courseId", protect, authorize("instructor"), createLesson);
router.put("/:id", protect, authorize("instructor"), updateLesson);
router.delete("/:id", protect, authorize("instructor"), deleteLesson);

module.exports = router;
