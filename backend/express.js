const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------
// MongoDB connection
// --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// --------------------
// Import Models & Routes
// --------------------
const LostFound = require("./models/LostFound");
const confessionRoutes = require("./routes/confession");
const pyqRoutes = require("./routes/pyqs");   // ✅ ADD THIS

// --------------------
// Multer setup
// --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// --------------------
// Lost & Found Routes
// --------------------
app.get("/api/lostfound", async (req, res) => {
  try {
    const items = await LostFound.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lostfound", upload.single("photo"), async (req, res) => {
  try {
    const { type, itemName, description, email, contact } = req.body;

    if (!email.endsWith("@nitkkr.ac.in")) {
      return res.status(400).json({ message: "Only NIT email allowed" });
    }

    const newItem = new LostFound({
      type,
      itemName,
      description,
      email: email.trim().toLowerCase(),
      contact,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newItem.save();
    res.json(newItem);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/lostfound/:id/claim", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.email !== email.trim().toLowerCase()) {
      return res.status(403).json({ message: "Not authorized!" });
    }

    item.status = "claimed";
    await item.save();

    res.json({ message: "Status updated", item });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Routes
// --------------------
app.use("/api/confessions", confessionRoutes);
app.use("/api/pyqs", pyqRoutes);   // ✅ ADD THIS
const noteRoutes = require("./routes/notes");

app.use("/api/notes", noteRoutes);
// Start Server
// --------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));