const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const PastAssignment = require("../models/PastAssignment"); // Import new model
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

    // ✅ Check if an assignment with the same title already exists in the same class
    const existingAssignment = await Assignment.findOne({ title, className });
    if (existingAssignment) {
      return res.status(400).json({ error: "Assignment with the same title already exists in this class." });
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

// Get active assignments for a specific teacher
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

// Close an assignment: Move to PastAssignments and delete from Assignments
router.delete("/close/:assignmentID", async (req, res) => {
  try {
    const { assignmentID } = req.params;

    // Find the assignment to be closed
    const assignment = await Assignment.findById(assignmentID);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Create a past assignment record
    const pastAssignment = new PastAssignment({
      title: assignment.title,
      description: assignment.description,
      className: assignment.className,
      teacherName: assignment.teacherName,
      createdAt: assignment.createdAt,
      dueDate: assignment.dueDate,
      closedAt: new Date(),
    });

    // Save the past assignment
    await pastAssignment.save();

    // Remove the assignment from the active list
    await Assignment.findByIdAndDelete(assignmentID);

    res.json({ message: "Assignment closed and moved to past assignments" });
  } catch (error) {
    console.error("Error closing assignment:", error);
    res.status(500).json({ error: "Failed to close assignment" });
  }
});

// Get past assignments for a teacher
router.get("/past/:teacherName", async (req, res) => {
  try {
    const { teacherName } = req.params;
    const pastAssignments = await PastAssignment.find({ teacherName });
    res.json(pastAssignments);
  } catch (error) {
    console.error("Error fetching past assignments:", error);
    res.status(500).json({ error: "Failed to fetch past assignments" });
  }
});

module.exports = router;
