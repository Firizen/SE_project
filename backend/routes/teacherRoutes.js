const express = require("express");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");

const router = express.Router();
const JWT_SECRET = "your_secret_key"; // Replace with a secure key

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

// Fetch Teacher Details (Including Plagiarism Alerts)
router.get("/details", verifyToken, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    res.json({
      name: teacher.name,
      email: teacher.email,
      plagiarismAlertsEnabled: teacher.plagiarismAlertsEnabled,
    });
  } catch (error) {
    console.error("🚨 Error fetching teacher details:", error);
    res.status(500).json({ message: "Error fetching teacher details." });
  }
});

// Toggle Plagiarism Alerts
router.put("/toggle-plagiarism", verifyToken, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    // Toggle the plagiarismAlertsEnabled field
    teacher.plagiarismAlertsEnabled = !teacher.plagiarismAlertsEnabled;
    await teacher.save();

    res.status(200).json({ plagiarismAlertsEnabled: teacher.plagiarismAlertsEnabled });
  } catch (error) {
    console.error("🚨 Error toggling plagiarism alerts:", error);
    res.status(500).json({ message: "Error toggling plagiarism alerts." });
  }
});

module.exports = router;
