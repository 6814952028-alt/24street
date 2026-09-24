require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/user.model");

const run = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before creating an admin");
  await connectDB();
  let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select("+password");
  if (user) { user.role = "admin"; if (ADMIN_NAME) user.name = ADMIN_NAME; await user.save(); console.log(`Promoted ${user.email} to admin`); }
  else { user = await User.create({ name: ADMIN_NAME || "Store Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin" }); console.log(`Created admin ${user.email}`); }
  process.exit(0);
};
run().catch(error => { console.error(error.message); process.exit(1); });
