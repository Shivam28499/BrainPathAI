const express = require("express");
const router = express.Router();
const { getDiscussions, createDiscussion, createReply } = require("../controllers/discussionController");
const { protect } = require("../middleware/auth");

router.get("/course/:courseId", getDiscussions);
router.post("/course/:courseId", protect, createDiscussion);
router.post("/:discussionId/reply", protect, createReply);

module.exports = router;
