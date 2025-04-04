const mongoose = require("mongoose");

const pastAssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  className: { type: String, required: true },
  teacherName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  closedAt: { type: Date, default: Date.now } // Timestamp when closed
});

module.exports = mongoose.model("PastAssignment", pastAssignmentSchema);
