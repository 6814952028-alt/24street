const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const publicUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  addresses: user.addresses,
  role: user.role,
  createdAt: user.createdAt,
});

const createToken = user => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("Server authentication is not configured: JWT_SECRET is missing");
    error.statusCode = 500;
    throw error;
  }
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, ver: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.exists({ email: email?.toLowerCase() });
    if (exists) return res.status(409).json({ message: "This email is already registered" });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password +tokenVersion");
    if (!user || !(await user.isPasswordCorrect(password || ""))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
};

const getMe = (req, res) => res.json({ user: publicUser(req.user) });

const logout = async (req, res, next) => {
  try {
    // Bumping the version invalidates the current JWT (and any other active sessions).
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    res.status(204).end();
  } catch (error) { next(error); }
};

const updateMe = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "addresses"];
    allowed.forEach(key => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
    if (req.body.password) req.user.password = req.body.password;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) { next(error); }
};

const listUsers = async (req, res, next) => {
  try {
    const search = req.query.q?.trim();
    const filter = search ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ users: users.map(publicUser) });
  } catch (error) { next(error); }
};

const updateUserByAdmin = async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    const allowed = ["name", "email", "phone", "addresses", "role"];
    allowed.forEach(key => { if (req.body[key] !== undefined) target[key] = req.body[key]; });
    if (target.role !== "admin" && target._id.equals(req.user._id) && req.body.role) return res.status(400).json({ message: "You cannot remove your own admin access" });
    await target.save();
    res.json({ user: publicUser(target) });
  } catch (error) { next(error); }
};

module.exports = { register, login, logout, getMe, updateMe, listUsers, updateUserByAdmin };
