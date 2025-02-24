const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");

// 📌 1. Submit an assignment (Student uploads file)
router.post("/submit-assignment", async (req, res) => {
  try {
    const { studentId, assignmentId, submissionFileUrl } = req.body;

    if (!studentId || !assignmentId || !submissionFileUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newSubmission = new Submission({
      studentId,
      assignmentId,
      submissionFileUrl
    });

    await newSubmission.save();
    res.status(201).json({ message: "Assignment submitted successfully", submission: newSubmission });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 2. View all submissions for an assignment (Teacher fetches submissions)
router.get("/submissions/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignmentId }).populate("studentId", "name email");
    
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 3. Update grade & feedback (Teacher reviews submission)
router.put("/grade-submission/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { grade, feedback },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json({ message: "Grade & feedback updated", submission: updatedSubmission });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
