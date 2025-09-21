const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 422;
      throw error;
    }

    const user = await User.create({ name, email, password });
    user.save();
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
      },
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      "someTokenSecretSecret",
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
