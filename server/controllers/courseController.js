const { Op } = require("sequelize");
const { Course, User, Lesson, Review, Enrollment } = require("../models");

// GET /api/courses
const getCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    const where = { status: "approved" };

    if (category) where.category = category;
    if (level) where.level = level;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { rows: courses, count } = await Course.findAndCountAll({
      where,
      include: [{ model: User, as: "instructor", attributes: ["id", "name", "avatar"] }],
      offset,
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.json({ courses, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/courses/:id
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: "instructor", attributes: ["id", "name", "avatar", "bio"] },
        { model: Lesson, as: "lessons", order: [["order", "ASC"]] },
        { model: Review, as: "reviews", include: [{ model: User, attributes: ["id", "name", "avatar"] }] },
      ],
    });

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/courses (instructor)
const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      level,
      price,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null,
      instructorId: req.user.id,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/courses/:id (instructor)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, category, level, price } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (level) course.level = level;
    if (price !== undefined) course.price = price;
    if (req.file) course.thumbnail = `/uploads/${req.file.filename}`;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/courses/:id (instructor)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await course.destroy();
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/courses/instructor/my-courses
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { instructorId: req.user.id },
      include: [{ model: Enrollment }],
      order: [["createdAt", "DESC"]],
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, getInstructorCourses };
