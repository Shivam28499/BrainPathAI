const { User, Course, Enrollment, Review } = require("../models");
const { sequelize } = require("../config/db");

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { role: "student" } });
    const totalInstructors = await User.count({ where: { role: "instructor" } });
    const totalCourses = await Course.count();
    const approvedCourses = await Course.count({ where: { status: "approved" } });
    const pendingCourses = await Course.count({ where: { status: "pending" } });
    const totalEnrollments = await Enrollment.count();

    res.json({
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      approvedCourses,
      pendingCourses,
      totalEnrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/courses/:id/approve
const approveCourse = async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.status = status;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/courses/pending
const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { status: "pending" },
      include: [{ model: User, as: "instructor", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getUsers, deleteUser, approveCourse, getPendingCourses };
