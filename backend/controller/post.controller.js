const { validationResult } = require("express-validator");

// ✅ GET all posts
exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first dummy post content",
        imageUrl: "images/mylogo.jpg", // هيترندر من /images
        creator: { name: "Ahmed" },
        createdAt: new Date(),
      },
      {
        _id: "2",
        title: "Second Post",
        content: "Another dummy content here",
        imageUrl: "images/duck.jpg",
        creator: { name: "Max" },
        createdAt: new Date(),
      },
    ],
    totalItems: 2,
  });
};

// ✅ CREATE a post
exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { title, content } = req.body;

  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      imageUrl: "images/mylogo.jpg",
      creator: { name: "Ahmed" },
      createdAt: new Date(),
    },
  });
};
