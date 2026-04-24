const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { connectDB, sequelize } = require("./config/db");
require("./models"); // Load all models and associations

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/documents", documentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "BrainPath AI server is running" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log("Database tables synced");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
