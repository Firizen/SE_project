const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// Get notifications for a specific student
// Get unread notifications for a specific student
router.get("/:studentID", async (req, res) => {
  try {
    const { studentID } = req.params;

    // Ensure studentID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentID)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    // Fetch only unread notifications
    const notifications = await Notification.find({ studentID, readStatus: false })
      .sort({ timestamp: -1 })
      .lean();

    if (!notifications.length) {
      return res.status(404).json({ message: "No unread notifications found" });
    }

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});


// Mark notification as read
router.put("/mark-as-read/:notificationID", async (req, res) => {
  try {
    const { notificationID } = req.params;

    // Ensure notificationID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(notificationID)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationID,
      { readStatus: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification: updatedNotification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});


module.exports = router;
