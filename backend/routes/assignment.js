const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// Create an assignment
router.post("/", async (req, res) => {
  try {
    const { title, description, className, teacherName, dueDate } = req.body;

    // Validate input
    if (!title || !className || !teacherName || !dueDate) {
      return res.status(400).json({ error: "Title, class name, teacher name, and due date are required." });
    }

    const newAssignment = new Assignment({ title, description, className, teacherName, dueDate });

    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    console.error("Error creating assignment:", err);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

// Get assignments for a specific teacher
router.get("/", async (req, res) => {
  try {
    const { teacherName } = req.query;

    if (!teacherName) {
      return res.status(400).json({ error: "Teacher name is required" });
    }

    const assignments = await Assignment.find({ teacherName });

    res.json(assignments);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});


module.exports = router;
