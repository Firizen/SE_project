const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Notification = require("../models/Notification");
const Student = require("../models/Student");

// Create an assignment and generate notifications
router.post("/", async (req, res) => {
  try {
    const { title, description, className, teacherName, dueDate } = req.body;

    // Validate input
    if (!title || !className || !teacherName || !dueDate) {
      return res.status(400).json({ error: "Title, class name, teacher name, and due date are required." });
    }

    const newAssignment = new Assignment({ title, description, className, teacherName, dueDate });
    await newAssignment.save();

    // Fetch students in the class
    const students = await Student.find({ studentClass: className }, "_id");

    if (students.length > 0) {
      // Create notifications for each student
      const notifications = students.map((student) => ({
        studentID: student._id,
        assignmentID: newAssignment._id,
        message: `New Assignment: ${title}`,
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json(newAssignment);
  } catch (err) {
    console.error("Error creating assignment:", err);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

// Get a single assignment by ID
router.get("/:assignmentID", async (req, res) => {
  try {
    const { assignmentID } = req.params;

    const assignment = await Assignment.findById(assignmentID);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({ error: "Failed to fetch assignment" });
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

// Students view assignments based on their class
router.get("/student/:className", async (req, res) => {
  try {
    const { className } = req.params;

    const assignments = await Assignment.find({ className });

    if (!assignments.length) {
      return res.status(404).json({ message: "No assignments found" });
    }

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;