const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password, class: studentClass } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const student = new Student({ name, email, password: hashedPassword, class: studentClass });
    await student.save();
    res.status(201).json({ message: "Student registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email });
  if (!student) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
