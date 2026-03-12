const express = require("express");
const router = express.Router();
const Confession = require("../models/Confession");


// 🔹 GET all confessions (Newest first)
router.get("/", async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 POST new confession
router.post("/", async (req, res) => {
  try {
    const { message, category } = req.body;

    if (!message || message.length < 10) {
      return res.status(400).json({
        message: "Confession must be at least 10 characters"
      });
    }

    // Generate next confessorId
    const last = await Confession.findOne().sort({ confessorId: -1 });
    const nextId = last ? last.confessorId + 1 : 1;

    const newConfession = new Confession({
      message,
      category,
      confessorId: nextId
    });

    await newConfession.save();
    res.json(newConfession);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 LIKE confession
router.put("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;

    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ message: "Not found" });

    const alreadyLiked = confession.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike
      confession.likes -= 1;
      confession.likedBy = confession.likedBy.filter(id => id !== userId);
    } else {
      // Like
      confession.likes += 1;
      confession.likedBy.push(userId);
    }

    await confession.save();
    res.json(confession);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 🔹 ADD comment
router.post("/:id/comment", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 2) {
      return res.status(400).json({
        message: "Comment too short"
      });
    }

    const confession = await Confession.findById(req.params.id);

    if (!confession) {
      return res.status(404).json({ message: "Not found" });
    }

    confession.comments.push({ text });
    await confession.save();

    res.json(confession);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;