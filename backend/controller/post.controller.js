const { validationResult } = require("express-validator");
const Post = require("../models/post.model");

// ✅ get all posts
//@desc Get all posts from the database
//@route  GET /feed/posts
exports.getPosts = (req, res, next) => {
  Post.find()
    // .populate("creator", "name") // Only populate the 'name' field from the 'creator' field. This replaces that ID with the actual User object (containing name).
    .then((posts) => {
      if (!posts) {
        const error = new Error("No posts found");
        error.status = 404;
        throw error;
      }
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: posts,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      console.log(error);
      next(error);
    });
};

// ✅ CREATE a post
//@desc create a post
//@route  POST /feed/post
exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const image = req.file;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    if (!image) {
      const error = new Error("No image found");
      error.statusCode = 404;
      throw error;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed : creating post");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const newPost = await Post.create({
      title: title,
      imageUrl: image.path,
      content: content,
      creator: { name: "Ahmed" },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// ✅ GET a single post
//@desc Get a single post from the database
//@route  GET /feed/post/:postId
exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      const error = new Error("No postId found");
      error.statusCode = 404;
      throw error;
    }

    Post.findById(postId).then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: "Post fetched successfully", post: post });
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
