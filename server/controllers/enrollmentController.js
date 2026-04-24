const { Enrollment, Course, Lesson, User } = require("../models");

// POST /api/enrollments/:courseId
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await Enrollment.findOne({
      where: { userId: req.user.id, courseId: req.params.courseId },
    });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId: req.params.courseId,
    });

    course.totalStudents += 1;
    await course.save();

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/enrollments/my-courses
const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Course,
          include: [{ model: User, as: "instructor", attributes: ["id", "name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/enrollments/complete-lesson
const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId },
    });
    if (!enrollment) return res.status(404).json({ message: "Not enrolled" });

    const completedLessons = JSON.parse(enrollment.completedLessons || "[]");
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.count({ where: { courseId } });
    const progress = (completedLessons.length / totalLessons) * 100;

    enrollment.completedLessons = JSON.stringify(completedLessons);
    enrollment.progress = progress;
    enrollment.isCompleted = progress >= 100;
    await enrollment.save();

    // Add XP points
    const user = await User.findByPk(req.user.id);
    user.xpPoints += 10;

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      user.streak = user.lastActiveDate === yesterday ? user.streak + 1 : 1;
      user.lastActiveDate = today;
    }
    await user.save();

    res.json({ enrollment, xpPoints: user.xpPoints, streak: user.streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollCourse, getMyCourses, completeLesson };
