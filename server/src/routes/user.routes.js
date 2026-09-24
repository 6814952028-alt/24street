const express = require("express");
const { register, login, logout, getMe, updateMe, listUsers, updateUserByAdmin } = require("../controllers/user.controller");
const { protect, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.get("/", protect, requireAdmin, listUsers);
router.patch("/:id", protect, requireAdmin, updateUserByAdmin);

module.exports = router;
