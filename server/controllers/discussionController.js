const { Discussion, DiscussionReply, User } = require("../models");

// GET /api/discussions/course/:courseId
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      where: { courseId: req.params.courseId },
      include: [
        { model: User, attributes: ["id", "name", "avatar"] },
        {
          model: DiscussionReply,
          as: "replies",
          include: [{ model: User, attributes: ["id", "name", "avatar"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/discussions/course/:courseId
const createDiscussion = async (req, res) => {
  try {
    const { title, content } = req.body;
    const discussion = await Discussion.create({
      title,
      content,
      userId: req.user.id,
      courseId: req.params.courseId,
    });
    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/discussions/:discussionId/reply
const createReply = async (req, res) => {
  try {
    const { content } = req.body;
    const reply = await DiscussionReply.create({
      content,
      userId: req.user.id,
      discussionId: req.params.discussionId,
    });
    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDiscussions, createDiscussion, createReply };
