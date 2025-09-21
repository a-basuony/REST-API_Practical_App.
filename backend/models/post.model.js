const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // createdAt and updatedAt
);

module.exports = mongoose.model("Post", postSchema);
