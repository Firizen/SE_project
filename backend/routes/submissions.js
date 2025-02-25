const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");

// ✅ Submit an assignment
router.post("/", async (req, res) => {
  try {
    const { studentID, assignmentID } = req.body;

    if (!studentID || !assignmentID) {
      return res.status(400).json({ error: "Student ID and Assignment ID are required." });
    }

    // Check if the student exists
    const studentExists = await Student.findById(studentID);
    if (!studentExists) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Check if the assignment exists
    const assignmentExists = await Assignment.findById(assignmentID);
    if (!assignmentExists) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    // Check if the student has already submitted this assignment
    const existingSubmission = await Submission.findOne({ studentID, assignmentID });
    if (existingSubmission) {
      return res.status(400).json({ error: "Assignment already submitted." });
    }

    // Create the submission
    const newSubmission = new Submission({ studentID, assignmentID, submittedAt: new Date() });
    await newSubmission.save();

    res.status(201).json({ message: "Assignment submitted successfully!", submission: newSubmission });
  } catch (err) {
    console.error("Error submitting assignment:", err);
    res.status(500).json({ error: "Failed to submit assignment" });
  }
});

// ✅ Get submissions for a specific assignment
router.get("/", async (req, res) => {
  try {
    const { assignmentId } = req.query;

    if (!assignmentId) {
      return res.status(400).json({ error: "Assignment ID is required." });
    }

    // Find all submissions for this assignment
    const submissions = await Submission.find({ assignmentID: assignmentId });

    res.status(200).json(submissions);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

module.exports = router;
