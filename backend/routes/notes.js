const express = require("express");
const router = express.Router();
const multer = require("multer");
const Note = require("../models/Notes");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("pdf"), async (req, res) => {

  const { subject, title } = req.body;

  const newNote = new Note({
    subject,
    title,
    fileUrl: "/uploads/" + req.file.filename
  });

  await newNote.save();

  res.json({ message: "Note uploaded successfully" });

});

router.get("/", async (req, res) => {

  const notes = await Note.find();
  res.json(notes);

});

module.exports = router;