const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const router = express.Router();

const JWT_SECRET = "your_secret_key"; // Change this to a secure key

// ✅ Student Login
router.post("/student-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Ensure `email` and `studentID` are in the token
    const token = jwt.sign(
      { id: student._id, email: student.email, role: "student" }, 
      JWT_SECRET, 
      { expiresIn: "2h" }
    );

    res.json({
      token,
      student: {
        _id: student._id,
        name: student.name || "No Name",
        email: student.email || "No Email",
        studentClass: student.studentClass || "No Class",
      },
    });
  } catch (error) {
    console.error("🚨 Error in Student Login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Teacher Login (Includes `email` in token)
router.post("/teacher-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Ensure `email` is in the token (Fix for missing email in appeal routes)
    const token = jwt.sign(
      { id: teacher._id, name: teacher.name, email: teacher.email, role: "teacher" }, 
      JWT_SECRET, 
      { expiresIn: "2h" }
    );

    res.json({
      token,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
      },
    });
  } catch (error) {
    console.error("🚨 Error in Teacher Login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Student Signup
router.post("/student-signup", async (req, res) => {
  try {
    const { name, email, password, studentClass } = req.body;

    // ✅ Check if student already exists
    if (await Student.findOne({ email })) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, password: hashedPassword, studentClass });

    await student.save();
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("🚨 Error in Student Signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Teacher Signup
router.post("/teacher-signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Check if teacher already exists
    if (await Teacher.findOne({ email })) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({ name, email, password: hashedPassword });

    await teacher.save();
    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (error) {
    console.error("🚨 Error in Teacher Signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
