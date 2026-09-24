const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { isAdmin } = require("../services/authorization.service");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("+tokenVersion");
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    if ((payload.ver || 0) !== (user.tokenVersion || 0)) return res.status(401).json({ message: "Session has ended. Please sign in again" });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.user)) return res.status(403).json({ message: "Admin access required" });
  next();
};

module.exports = { protect, requireAdmin };
