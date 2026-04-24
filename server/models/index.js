const User = require("./User");
const Course = require("./Course");
const Lesson = require("./Lesson");
const Enrollment = require("./Enrollment");
const Quiz = require("./Quiz");
const QuizAttempt = require("./QuizAttempt");
const Bookmark = require("./Bookmark");
const Review = require("./Review");
const Discussion = require("./Discussion");
const DiscussionReply = require("./DiscussionReply");
const Certificate = require("./Certificate");
const ChatHistory = require("./ChatHistory");
const LearningPath = require("./LearningPath");
const Document = require("./Document");
const DocumentChunk = require("./DocumentChunk");

// User <-> Course (Instructor creates courses)
User.hasMany(Course, { foreignKey: "instructorId", as: "courses" });
Course.belongsTo(User, { foreignKey: "instructorId", as: "instructor" });

// Course <-> Lesson
Course.hasMany(Lesson, { foreignKey: "courseId", as: "lessons" });
Lesson.belongsTo(Course, { foreignKey: "courseId" });

// User <-> Course (Enrollment - many to many)
User.hasMany(Enrollment, { foreignKey: "userId" });
Enrollment.belongsTo(User, { foreignKey: "userId" });
Course.hasMany(Enrollment, { foreignKey: "courseId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

// Lesson <-> Quiz
Lesson.hasOne(Quiz, { foreignKey: "lessonId", as: "quiz" });
Quiz.belongsTo(Lesson, { foreignKey: "lessonId" });

// Quiz <-> QuizAttempt
Quiz.hasMany(QuizAttempt, { foreignKey: "quizId" });
QuizAttempt.belongsTo(Quiz, { foreignKey: "quizId" });
User.hasMany(QuizAttempt, { foreignKey: "userId" });
QuizAttempt.belongsTo(User, { foreignKey: "userId" });

// User <-> Bookmark <-> Course
User.hasMany(Bookmark, { foreignKey: "userId" });
Bookmark.belongsTo(User, { foreignKey: "userId" });
Course.hasMany(Bookmark, { foreignKey: "courseId" });
Bookmark.belongsTo(Course, { foreignKey: "courseId" });

// User <-> Review <-> Course
User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });
Course.hasMany(Review, { foreignKey: "courseId", as: "reviews" });
Review.belongsTo(Course, { foreignKey: "courseId" });

// Course <-> Discussion
Course.hasMany(Discussion, { foreignKey: "courseId", as: "discussions" });
Discussion.belongsTo(Course, { foreignKey: "courseId" });
User.hasMany(Discussion, { foreignKey: "userId" });
Discussion.belongsTo(User, { foreignKey: "userId" });

// Discussion <-> DiscussionReply
Discussion.hasMany(DiscussionReply, { foreignKey: "discussionId", as: "replies" });
DiscussionReply.belongsTo(Discussion, { foreignKey: "discussionId" });
User.hasMany(DiscussionReply, { foreignKey: "userId" });
DiscussionReply.belongsTo(User, { foreignKey: "userId" });

// User <-> Certificate <-> Course
User.hasMany(Certificate, { foreignKey: "userId" });
Certificate.belongsTo(User, { foreignKey: "userId" });
Course.hasMany(Certificate, { foreignKey: "courseId" });
Certificate.belongsTo(Course, { foreignKey: "courseId" });

// User <-> ChatHistory
User.hasMany(ChatHistory, { foreignKey: "userId" });
ChatHistory.belongsTo(User, { foreignKey: "userId" });

// User <-> LearningPath
User.hasOne(LearningPath, { foreignKey: "userId", as: "learningPath" });
LearningPath.belongsTo(User, { foreignKey: "userId" });

// User <-> Document <-> DocumentChunk
User.hasMany(Document, { foreignKey: "userId", as: "documents" });
Document.belongsTo(User, { foreignKey: "userId" });
Document.hasMany(DocumentChunk, { foreignKey: "documentId", as: "chunks", onDelete: "CASCADE" });
DocumentChunk.belongsTo(Document, { foreignKey: "documentId" });

module.exports = {
  User,
  Course,
  Lesson,
  Enrollment,
  Quiz,
  QuizAttempt,
  Bookmark,
  Review,
  Discussion,
  DiscussionReply,
  Certificate,
  ChatHistory,
  LearningPath,
  Document,
  DocumentChunk,
};
