const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadDocument,
  listDocuments,
  getDocument,
  askDocument,
  deleteDocument,
} = require("../controllers/documentController");
const { protect } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// Wrap multer to convert its errors into clean JSON responses
const uploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File too large (max 50MB)" });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get("/", protect, listDocuments);
router.get("/:id", protect, getDocument);
router.post("/upload", protect, uploadMiddleware, uploadDocument);
router.post("/:id/ask", protect, askDocument);
router.delete("/:id", protect, deleteDocument);

module.exports = router;
