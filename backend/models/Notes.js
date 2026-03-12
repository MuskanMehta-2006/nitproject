const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  subject: String,
  title: String,
  fileUrl: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Note", noteSchema);