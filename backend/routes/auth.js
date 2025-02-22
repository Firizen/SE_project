const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const router = express.Router();

const JWT_SECRET = "your_secret_key"; // Change this to a secure key

// 📌 Student Login
router.post("/student-login", async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email });

  if (!student) return res.status(400).json({ message: "Student not found" });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: student._id, role: "student" }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// 📌 Teacher Login
router.post("/teacher-login", async (req, res) => {
  const { email, password } = req.body;
  const teacher = await Teacher.findOne({ email });

  if (!teacher) return res.status(400).json({ message: "Teacher not found" });

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: teacher._id, role: "teacher" }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
