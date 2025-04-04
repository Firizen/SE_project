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

// ✅ Submit or Resubmit an Assignment (Fixed)
router.post("/submit", upload.single("document"), async (req, res) => {
  try {
    console.log("Received data:", req.body);
    console.log("Received file:", req.file);

    const { studentID, assignmentID } = req.body;
    if (!studentID || !assignmentID || !req.file) {
      return res.status(400).json({ error: "All fields and document are required." });
    }

    // Validate student and assignment existence
    const studentExists = await Student.findById(studentID);
    if (!studentExists) return res.status(404).json({ error: "Student not found." });

    const assignmentExists = await Assignment.findById(assignmentID);
    if (!assignmentExists) return res.status(404).json({ error: "Assignment not found." });

    // Check for existing submission
    let existingSubmission = await Submission.findOne({ studentID, assignmentID });

    if (existingSubmission) {
      // Store previous submission before overwriting
      console.log("Resubmitting assignment...");
      existingSubmission.attempts.push({
        document: existingSubmission.document,
        contentType: existingSubmission.contentType,
        timestamp: existingSubmission.submittedAt,
      });

      existingSubmission.document = req.file.buffer;
      existingSubmission.contentType = req.file.mimetype;
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = "resubmitted";

      await existingSubmission.save();
      return res.status(200).json({ message: "Assignment resubmitted successfully!" });
    } else {
      // Create new submission
      console.log("Submitting new assignment...");
      const newSubmission = new Submission({
        studentID,
        assignmentID,
        document: req.file.buffer,
        contentType: req.file.mimetype,
        submittedAt: new Date(),
      });

      await newSubmission.save();
      return res.status(201).json({ message: "Assignment submitted successfully!" });
    }
  } catch (err) {
    console.error("Error submitting/resubmitting assignment:", err);
    res.status(500).json({ error: "Failed to submit assignment" });
  }
});

// ✅ Get submitted document by studentID and assignmentID
router.get("/document", async (req, res) => {
  try {
    const { studentID, assignmentID } = req.query;

    if (!studentID || !assignmentID) {
      return res.status(400).json({ error: "Student ID and Assignment ID are required." });
    }

    const submission = await Submission.findOne({ studentID, assignmentID });
    if (!submission) {
      return res.status(404).json({ error: "Submission not found." });
    }

    // Set correct content type and send document
    res.set("Content-Type", submission.contentType);
    res.send(submission.document);
  } catch (err) {
    console.error("Error fetching submitted document:", err);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// ✅ Delete a submission
router.delete("/delete", async (req, res) => {
  try {
    const { studentID, assignmentID } = req.body;

    if (!studentID || !assignmentID) {
      return res.status(400).json({ error: "Student ID and Assignment ID are required." });
    }

    console.log(`Deleting submission for student: ${studentID}, assignment: ${assignmentID}`);

    const deletedSubmission = await Submission.findOneAndDelete({ studentID, assignmentID });

    if (!deletedSubmission) {
      console.log("Submission not found in the database");
      return res.status(404).json({ error: "Submission not found." });
    }

    console.log("Submission deleted successfully:", deletedSubmission);
    res.status(200).json({ message: "Submission deleted successfully!" });
  } catch (err) {
    console.error("Error deleting submission:", err);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

// ✅ Request resubmission
router.post("/resubmit", async (req, res) => {
  try {
    const { studentID, assignmentID } = req.body;

    if (!studentID || !assignmentID) {
      return res.status(400).json({ error: "Student ID and Assignment ID are required." });
    }

    // Find the submission
    const submission = await Submission.findOne({ studentID, assignmentID });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found." });
    }

    // Update the submission status to "pending"
    submission.status = "pending";
    await submission.save();

    res.status(200).json({ message: "Resubmission requested successfully!" });
  } catch (err) {
    console.error("Error requesting resubmission:", err);
    res.status(500).json({ error: "Failed to request resubmission" });
  }
});

// ✅ Get all submissions for a specific assignment
router.get("/", async (req, res) => {
  try {
    const { assignmentId } = req.query;

    if (!assignmentId) {
      return res.status(400).json({ error: "Assignment ID is required." });
    }

    const submissions = await Submission.find({ assignmentID: assignmentId });
    res.status(200).json(submissions);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }


});


module.exports = router;