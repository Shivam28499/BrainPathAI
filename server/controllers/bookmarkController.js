const { Bookmark, Course, User } = require("../models");

// POST /api/bookmarks/:courseId
const toggleBookmark = async (req, res) => {
  try {
    const existing = await Bookmark.findOne({
      where: { userId: req.user.id, courseId: req.params.courseId },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ message: "Bookmark removed" });
    }

    const bookmark = await Bookmark.create({
      userId: req.user.id,
      courseId: req.params.courseId,
    });
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookmarks
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Course,
          include: [{ model: User, as: "instructor", attributes: ["id", "name"] }],
        },
      ],
    });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleBookmark, getBookmarks };
