const express = require("express");
const multer = require("multer");
const { put } = require("@vercel/blob");
const { protect, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

router.post("/", protect, requireAdmin, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "An image file is required" });
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({ message: "Vercel Blob is not configured" });
    }

    const blob = await put(`products/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      addRandomSuffix: true,
    });
    res.status(201).json({ url: blob.url });
  } catch (error) {
    next(error);
  }
});

module.exports = router;