const { Certificate, Enrollment, Course, User } = require("../models");

// POST /api/certificates/:courseId
const generateCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId: req.params.courseId },
    });

    if (!enrollment) return res.status(404).json({ message: "Not enrolled in this course" });
    if (!enrollment.isCompleted) return res.status(400).json({ message: "Course not completed yet" });

    const existing = await Certificate.findOne({
      where: { userId: req.user.id, courseId: req.params.courseId },
    });
    if (existing) return res.json(existing);

    const course = await Course.findByPk(req.params.courseId);
    const user = await User.findByPk(req.user.id);

    const certificate = await Certificate.create({
      userId: req.user.id,
      courseId: req.params.courseId,
      certificateUrl: null,
    });

    // Add bonus XP for certificate
    user.xpPoints += 50;
    await user.save();

    res.status(201).json({
      certificate,
      studentName: user.name,
      courseName: course.title,
      completedAt: certificate.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/certificates
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { userId: req.user.id },
      include: [{ model: Course, attributes: ["id", "title", "category"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateCertificate, getMyCertificates };
