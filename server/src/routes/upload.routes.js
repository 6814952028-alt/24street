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
    const imagesInput = req.body.images;
    let images = [];
    if (typeof imagesInput === "string") {
      try { images = JSON.parse(imagesInput); } catch { images = imagesInput.split(","); }
    } else if (Array.isArray(imagesInput)) images = imagesInput;
    if (!Array.isArray(images)) images = [];
    images = images.map(url => String(url).trim()).filter(Boolean);

    // URL-only requests do not need Blob. A missing token also falls back to supplied URLs.
    if (!req.file || !process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(200).json({ images });
    }

    const blob = await put(`products/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      addRandomSuffix: true,
    });
    res.status(201).json({ url: blob.url, images });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
