require("dotenv").config({ path: require("path").join(__dirname, "..", "server", ".env") });

const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return res.status(503).json({ message: "Database unavailable" });
  }
};