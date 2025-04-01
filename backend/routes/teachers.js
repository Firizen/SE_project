const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");

// ✅ Get all teachers
router.get("/", async (req, res) => {
  try {
    // Fetch all teachers from the collection
    const teachers = await Teacher.find({}, "name email"); // Selecting only name and email

    if (teachers.length === 0) {
      return res.status(404).json({ error: "No teachers found" });
    }

    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
