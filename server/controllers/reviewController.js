const { Review, User, Course } = require("../models");
const { sequelize } = require("../config/db");

// POST /api/reviews/:courseId
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const existing = await Review.findOne({
      where: { userId: req.user.id, courseId: req.params.courseId },
    });
    if (existing) return res.status(400).json({ message: "Already reviewed" });

    const review = await Review.create({
      rating,
      comment,
      userId: req.user.id,
      courseId: req.params.courseId,
    });

    // Update course average rating
    const result = await Review.findOne({
      where: { courseId: req.params.courseId },
      attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avgRating"]],
      raw: true,
    });

    await Course.update(
      { rating: parseFloat(result.avgRating).toFixed(1) },
      { where: { id: req.params.courseId } }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/:courseId
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { courseId: req.params.courseId },
      include: [{ model: User, attributes: ["id", "name", "avatar"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviews };
