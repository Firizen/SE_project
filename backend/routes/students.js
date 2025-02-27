const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// ✅ Get students by className
router.get("/", async (req, res) => {
  try {
    const { className } = req.query; // Query parameter

    if (!className) {
      return res.status(400).json({ error: "Class name is required" });
    }

    // 🔍 Find students with matching studentClass
    const students = await Student.find({ studentClass: className });

    if (students.length === 0) {
      return res.status(404).json({ error: "No students found for this class" });
    }

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;