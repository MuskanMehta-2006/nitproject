const mongoose = require("mongoose");

const pyqSchema = new mongoose.Schema({
  dept: String,
  subCode: String,
  subName: String,
  examType: String,
  year: String,
  fileUrl: String
});

module.exports = mongoose.model("Pyq", pyqSchema);