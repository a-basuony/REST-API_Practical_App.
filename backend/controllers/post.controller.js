const path = require("path");
const fs = require("fs");

const { validationResult } = require("express-validator");
const Post = require("../models/post.model");

const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.log("❌ Error deleting file:", err);
    else console.log("✅ File deleted:", fullPath);
  });
};

// ✅ Get all posts
// GET /feed/posts
exports.getPosts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 5;

    const posts = await Post.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("creator", "name");
    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// ✅ Create a post
// POST /feed/post
exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed: creating post");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    if (!image) {
      const error = new Error("No image provided");
      error.statusCode = 422;
      throw error;
    }

    const newPost = await Post.create({
      title,
      content,
      imageUrl: image.path.replace("\\", "/"), // fix Windows path
      creator: { name: "Ahmed" },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// ✅ Update a post
// PUT /feed/post/:postId
exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed: updating post");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("No post found");
      error.statusCode = 404;
      throw error;
    }

    if (image !== post.imageUrl) {
      // delete old image
      deleteFile(post.imageUrl);
      post.imageUrl = image.path.replace("\\", "/");
    }

    post.title = title;
    post.content = content;

    const updatedPost = await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// ✅ Get a single post
// GET /feed/post/:postId
exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("No post found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// ✅ Delete a post
// DELETE /feed/post/:postId
exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("No post found");
      error.statusCode = 404;
      throw error;
    }

    deleteFile(post.imageUrl);
    // await Post.findByIdAndRemove(postId);
    await Post.deleteOne({ _id: postId });

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
