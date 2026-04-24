const express = require("express");
const router = express.Router();
const { toggleBookmark, getBookmarks } = require("../controllers/bookmarkController");
const { protect } = require("../middleware/auth");

router.post("/:courseId", protect, toggleBookmark);
router.get("/", protect, getBookmarks);

module.exports = router;
