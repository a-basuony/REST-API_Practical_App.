const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const multer = require("multer");

const feedRoutes = require("./routes/post.routes");
const authRoutes = require("./routes/auth.routes");
const connectDB = require("./config/db");

const app = express();
dotenv.config();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // Store inside "images" folder
  },
  filename: (req, file, cb) => {
    // Replace ":" with "-" for Windows compatibility
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// Routes
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

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
