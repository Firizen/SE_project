const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const router = express.Router();

const JWT_SECRET = "your_secret_key"; // Change this to a secure key

// 📌 Student Login
// 📌 Student Login
router.post("/student-login", async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email });

  if (!student) return res.status(400).json({ message: "Student not found" });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: student._id, role: "student" }, JWT_SECRET, { expiresIn: "1h" });

  // ✅ Ensure student._id is included in the response
  res.json({
    token,
    student: {
      _id: student._id,  // ✅ Add this
      name: student.name || "No Name",
      email: student.email || "No Email",
      studentClass: student.studentClass || "No Class",
    },
  });
});




// 📌 Teacher Login
router.post("/teacher-login", async (req, res) => {
  const { email, password } = req.body;
  const teacher = await Teacher.findOne({ email });

  if (!teacher) return res.status(400).json({ message: "Teacher not found" });

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: teacher._id, role: "teacher" }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    token,
    teacher: {
      name: teacher.name,
      email: teacher.email
    }
  });
});


// 📌 Student Signup

router.post("/student-signup", async (req, res) => {
  const { name, email, password, studentClass } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const student = new Student({ name, email, password: hashedPassword, studentClass });
    await student.save();
    res.status(201).json({ message: "Student registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// 📌 Teacher Signup

router.post("/teacher-signup", async (req, res) => {
  const { name, email, password} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const teacher = new Teacher({ name, email, password: hashedPassword});
    await teacher.save();
    res.status(201).json({ message: "Teacher registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const ADMIN_CREDENTIALS = {
  email: "admin@institute.com",  // Change this to your admin email
  password: "securepassword123" // Change this to your secure password
};

// Admin Login Route
router.post("/admin-login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Generate JWT Token
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });

      res.json({
          message: "Admin login successful",
          token,
          admin: { name: "Admin", email }
      });
  } else {
      res.status(401).json({ message: "Invalid admin credentials" });
  }
});



module.exports = router;