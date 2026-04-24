const { User } = require("../models");

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "student" },
      attributes: ["id", "name", "avatar", "xpPoints", "streak"],
      order: [["xpPoints", "DESC"]],
      limit: 50,
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };
