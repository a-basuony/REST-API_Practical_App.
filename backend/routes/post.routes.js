const express = require("express");
const { getPosts, createPost } = require("../controller/post.controller");
const { body } = require("express-validator");

const router = express.Router();

router.get("/posts", getPosts);

// POST /feed/post
router.post(
  "/post",
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters long"),
    body("content")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Content must be at least 5 characters long     "),
  ],

  createPost
);

module.exports = router;
