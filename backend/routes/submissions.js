const express = require("express");
const multer = require("multer");
const router = express.Router();
const Submission = require("../models/Submission");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");

// Initialize Multer for file uploads (stores files in memory)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Check if a student has already submitted an assignment
router.get("/checkStudentSubmission", async (req, res) => {
  try {
    const { studentID, assignmentID } = req.query;
    if (!studentID || !assignmentID) {
      return res.status(400).json({ error: "Student ID and Assignment ID are required." });
    }

    const submission = await Submission.findOne({ studentID, assignmentID });
    res.status(200).json({ submitted: !!submission });
  } catch (err) {
    console.error("Error checking submission:", err);
    res.status(500).json({ error: "Failed to check submission" });
  }
});

// ✅ Submit an assignment with document upload
router.post("/submit", upload.single("document"), async (req, res) => {
  try {
    const { studentID, assignmentID } = req.body;
    if (!studentID || !assignmentID || !req.file) {
      return res.status(400).json({ error: "All fields and document are required." });
    }

    // Validate student and assignment existence
    const studentExists = await Student.findById(studentID);
    if (!studentExists) return res.status(404).json({ error: "Student not found." });

    const assignmentExists = await Assignment.findById(assignmentID);
    if (!assignmentExists) return res.status(404).json({ error: "Assignment not found." });

    // Ensure assignment is not already submitted
    const existingSubmission = await Submission.findOne({ studentID, assignmentID });
    if (existingSubmission) return res.status(400).json({ error: "Assignment already submitted." });

    // Store document as binary data
    const newSubmission = new Submission({
      studentID,
      assignmentID,
      document: req.file.buffer,
      contentType: req.file.mimetype,
      submittedAt: new Date()
    });

    await newSubmission.save();
    res.status(201).json({ message: "Assignment submitted successfully!" });
  } catch (err) {
    console.error("Error submitting assignment:", err);
    res.status(500).json({ error: "Failed to submit assignment" });
  }
});

router.get("/getSubmittedDocument", async (req, res) => {
  try {
    const { studentID, assignmentID } = req.query;
    if (!studentID || !assignmentID) {
      return res.status(400).json({ error: "Student ID and Assignment ID are required." });
    }

    const submission = await Submission.findOne({ studentID, assignmentID });
    if (!submission) {
      return res.status(404).json({ error: "No submission found." });
    }

    res.setHeader("Content-Type", submission.contentType);
    res.send(submission.document);
  } catch (err) {
    console.error("Error fetching submitted document:", err);
    res.status(500).json({ error: "Failed to fetch submitted document" });
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