const express = require("express");
const router = express.Router();
const { generateCertificate, getMyCertificates } = require("../controllers/certificateController");
const { protect } = require("../middleware/auth");

router.post("/:courseId", protect, generateCertificate);
router.get("/", protect, getMyCertificates);

module.exports = router;
