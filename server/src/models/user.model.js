const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, maxlength: 30 },
  recipient: { type: String, trim: true, maxlength: 100 },
  phone: { type: String, trim: true, maxlength: 30 },
  line1: { type: String, trim: true, maxlength: 200 },
  district: { type: String, trim: true, maxlength: 100 },
  province: { type: String, trim: true, maxlength: 100 },
  postalCode: { type: String, trim: true, maxlength: 20 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, required: true, minlength: 8, select: false },
  phone: { type: String, trim: true, maxlength: 30 },
  addresses: { type: [addressSchema], default: [] },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  tokenVersion: { type: Number, default: 0, select: false },
}, { timestamps: true });

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordCorrect = function isPasswordCorrect(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
