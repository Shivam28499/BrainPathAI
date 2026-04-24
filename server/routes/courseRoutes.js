const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get("/", getCourses);
router.get("/instructor/my-courses", protect, authorize("instructor"), getInstructorCourses);
router.get("/:id", getCourseById);
router.post("/", protect, authorize("instructor"), upload.single("thumbnail"), createCourse);
router.put("/:id", protect, authorize("instructor"), upload.single("thumbnail"), updateCourse);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteCourse);

module.exports = router;
