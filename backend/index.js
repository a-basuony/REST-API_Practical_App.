const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const feedRoutes = require("./routes/post.routes");
const connectDB = require("./config/db");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.use("/feed", feedRoutes);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

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
