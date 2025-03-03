const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true }, // Indexed for faster queries
  assignmentID: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true, index: true },
  message: { type: String, required: true },
  readStatus: { type: Boolean, default: false, index: true }, // Index for quick filtering
  timestamp: { type: Date, default: Date.now, index: true }, // Sort efficiently by timestamp
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
