const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected");
  } catch (error) {
    console.log("❌ DB connection error:", error.message);
    process.exit(1); // Exit if DB is down
  }
}

module.exports = connectDB;
