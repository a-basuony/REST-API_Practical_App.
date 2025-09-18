const { validationResult } = require("express-validator");
const Post = require("../models/post.model");

// ✅ GET all posts
exports.getPosts = (req, res, next) => {
  // res.status(200).json({
  //   posts: [
  //     {
  //       _id: "1",
  //       title: "First Post",
  //       content: "This is the first dummy post content",
  //       imageUrl: "images/mylogo.jpg", // هيترندر من /images
  //       creator: { name: "Ahmed" },
  //       createdAt: new Date(),
  //     },
  //     {
  //       _id: "2",
  //       title: "Second Post",
  //       content: "Another dummy content here",
  //       imageUrl: "images/duck.jpg",
  //       creator: { name: "Max" },
  //       createdAt: new Date(),
  //     },
  //   ],
  //   totalItems: 2,
  // });
};

// ✅ CREATE a post
//@desc create a post
//@route  POST /feed/post
exports.createPost = async (req, res, next) => {
  try {
    const { title, imagePath, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
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
      imagePath: "images/mylogo.jpg",
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

exports.getPost = async (req, res, next) => {
  try {
    const prodId = req.params.prodId;
    if (!prodId) {
      const error = new Error("No postId found");
      error.statusCode = 404;
      throw error;
    }

    Post.findById(prodId).then((post) => {
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
