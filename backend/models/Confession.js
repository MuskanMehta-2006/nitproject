const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 300
    },
    userId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);
const confessionSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500
    },
    category: {
      type: String,
      default: "General"
    },
    confessorId: {
      type: Number,
      required: true
    },
      likedBy: {
    type: [String],   // store user ids
    default: []
  },
    likes: {
      type: Number,
      default: 0
    },
    comments: [commentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Confession", confessionSchema);