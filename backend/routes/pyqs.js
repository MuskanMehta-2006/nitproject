const express = require("express");
const router = express.Router();
const Pyq = require("../models/Pyq");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });
router.get("/bulk-insert", async (req, res) => {
  try {
    const folderPath = path.join(__dirname, "../uploads");
    const files = fs.readdirSync(folderPath);

    for (let file of files) {

      if (!file.endsWith(".pdf")) continue;

      const nameWithoutExt = file.replace(".pdf", "");
      const parts = nameWithoutExt.split("_");

      const dept = parts[0];
      const subCode = parts[1];
      const subName = parts[2];
      const examType = parts[3];
      const year = parts[4];

      await Pyq.create({
        dept,
        subCode,
        subName,
        examType,
        year,
        fileUrl: `/uploads/${file}`
      });
    }

    res.send("Bulk Insert Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});
router.get("/", async (req, res) => {
  try {
    const data = await Pyq.find();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {

    console.log(req.body);
    console.log(req.file);  // debug

    const { dept, subCode, subject, examType, year } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newPyq = new Pyq({
      dept: dept,
      subCode: subCode,
      subName: subject,
      examType: examType,
      year: year,
      fileUrl: "/uploads/" + req.file.filename
    });

    await newPyq.save();

    res.json({ message: "Uploaded successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});
router.get("/filter", async (req, res) => {
  const { subCode } = req.query;

  const data = await Pyq.find({ subCode });
  res.json(data);
});
module.exports = router;