const express = require("express");
const router = express.Router();
const { createReview, getReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.post("/:courseId", protect, createReview);
router.get("/:courseId", getReviews);

module.exports = router;
