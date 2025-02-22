const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// Create an assignment
router.post("/", async (req, res) => {
  try {
    const { title, description, className } = req.body;
    const newAssignment = new Assignment({ title, description, className });

    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    console.error("Error creating assignment:", err);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

module.exports = router;