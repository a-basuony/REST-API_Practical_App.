const express = require("express");
const { body } = require("express-validator");

const {
  createPost,
  updatePost,
  getPost,
  getPosts,
  deletePost,
} = require("../controllers/post.controller");

const router = express.Router();

// Get all posts
// GET /feed/posts
router.get("/posts", getPosts);

// Create a post
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
      .withMessage("Content must be at least 5 characters long"),
  ],
  createPost
);

// Update a post
// PUT /feed/post/:postId
router.put(
  "/post/:postId",
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters long"),
    body("content")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Content must be at least 5 characters long"),
  ],
  updatePost
);

// Get a single post
// GET /feed/post/:postId
router.get("/post/:postId", getPost);

// Delete a post
// DELETE /feed/post/:postId
router.delete("/post/:postId", deletePost);

module.exports = router;
