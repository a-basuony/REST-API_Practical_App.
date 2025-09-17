const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

const postRoutes = require("./routes/post.routes");
const connectDB = require("./config/db");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
// Middleware
// app.use(bodyParser.urlencoded({ extended: false })); // form parser

app.use(bodyParser.json()); // application/json parser
app.use(morgan("dev"));
app.use(cors()); // ✅ عشان frontend يقدر يوصل للـ backend
app.use("/images", express.static("images"));

// Routes
app.use("/feed", postRoutes);

connectDB()
  .then(() => {
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} and Database connected`);
    });
  })
  .catch((error) => {
    console.error("❌ DB connection error:", error.message);
  });
