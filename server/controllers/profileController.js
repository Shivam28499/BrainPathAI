const { User } = require("../models");

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills } = req.body;
    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      avatar: user.avatar,
      xpPoints: user.xpPoints,
      streak: user.streak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
