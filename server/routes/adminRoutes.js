const express = require("express");
const router = express.Router();
const {
  getStats,
  getUsers,
  deleteUser,
  approveCourse,
  getPendingCourses,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.get("/stats", protect, authorize("admin"), getStats);
router.get("/users", protect, authorize("admin"), getUsers);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
router.put("/courses/:id/approve", protect, authorize("admin"), approveCourse);
router.get("/courses/pending", protect, authorize("admin"), getPendingCourses);

module.exports = router;
