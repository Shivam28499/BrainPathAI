const express = require("express");
const router = express.Router();
const { enrollCourse, getMyCourses, completeLesson } = require("../controllers/enrollmentController");
const { protect } = require("../middleware/auth");

router.post("/:courseId", protect, enrollCourse);
router.get("/my-courses", protect, getMyCourses);
router.put("/complete-lesson", protect, completeLesson);

module.exports = router;
