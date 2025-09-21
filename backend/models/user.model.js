const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [4, "Password must be at least 4 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);
// avatar: {
//   type: String,
//   default: "images/avatar.png",
// },

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if password was changed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔑 Compare password during login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);

// this doesn't work in arrow function
// so use it in normal function ✅ الحل: لازم تستخدم function عادية بدل arrow function.
// userSchema.pre("save", async function(next) {
//   if (!this.isModified("password")) return next(); // only hash if password was changed
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });
