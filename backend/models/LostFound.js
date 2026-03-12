const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    },
    photoUrl: String,
    status: {
      type: String,
      default: "available"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);