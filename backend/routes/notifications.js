const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Teacher = require("../models/Teacher");

// ✅ Fetch notifications for a specific student
router.get("/:studentID", async (req, res) => {
  try {
    const { studentID } = req.params;
    
    if (!studentID) {
      return res.status(400).json({ error: "Student ID is required." });
    }

    // ✅ Check if the student has a teacher
    const teacher = await Teacher.findOne({ students: studentID });

    if (!teacher) {
      console.warn(`⚠️ No teacher found for student ${studentID}`);
    }

    let query = { studentID, readStatus: false };

    // ✅ Exclude plagiarism alerts if teacher has disabled them
    if (teacher && !teacher.plagiarismAlertsEnabled) {
      query.message = { $not: { $regex: "plagiarism", $options: "i" } };
    }

    const notifications = await Notification.find(query).sort({ timestamp: -1 }).lean();

    if (!notifications.length) {
      return res.status(200).json({ message: "No unread notifications found." });
    }

    res.json(notifications);
  } catch (error) {
    console.error("🚨 Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications. Try again later." });
  }
});

// ✅ Flag plagiarism and create a notification
router.post("/flag-plagiarism", async (req, res) => {
  try {
    const { submissionId, studentId, assignmentTitle, assignmentID } = req.body;

    // ✅ Validate request body
    if (!submissionId || !studentId || !assignmentTitle || !assignmentID) {
      return res.status(400).json({ error: "Missing required fields: submissionId, studentId, assignmentTitle, assignmentID" });
    }

    // ✅ Create a plagiarism notification
    const notification = new Notification({
      studentID: studentId,
      assignmentID, // ✅ Now including assignmentID
      message: `Your submission for "${assignmentTitle}" was flagged for plagiarism.`,
      flagged: true,
      timestamp: new Date(),
      readStatus: false,
    });

    await notification.save();

    res.json({ message: "Plagiarism flagged successfully" });
  } catch (error) {
    console.error("🚨 Error flagging plagiarism:", error);
    res.status(500).json({ error: "Failed to flag plagiarism" });
  }
});

module.exports = router;
