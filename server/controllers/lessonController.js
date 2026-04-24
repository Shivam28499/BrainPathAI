const { Lesson, Course, Quiz } = require("../models");

// GET /api/lessons/course/:courseId
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { courseId: req.params.courseId },
      include: [{ model: Quiz, as: "quiz" }],
      order: [["order", "ASC"]],
    });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/lessons/course/:courseId (instructor)
const createLesson = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, videoUrl, content, duration } = req.body;

    const lessonCount = await Lesson.count({ where: { courseId: req.params.courseId } });

    const lesson = await Lesson.create({
      title,
      videoUrl,
      content,
      duration,
      order: lessonCount + 1,
      courseId: req.params.courseId,
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/lessons/:id (instructor)
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: Course }],
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.Course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, videoUrl, content, order, duration } = req.body;
    if (title) lesson.title = title;
    if (videoUrl) lesson.videoUrl = videoUrl;
    if (content) lesson.content = content;
    if (order) lesson.order = order;
    if (duration) lesson.duration = duration;

    await lesson.save();
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/lessons/:id (instructor)
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: Course }],
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.Course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await lesson.destroy();
    res.json({ message: "Lesson deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLessons, createLesson, updateLesson, deleteLesson };
