const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  className: { type: String, required: true }, // Class assigned to
  teacherName: { type: String, required: true }, // Name of the teacher
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true } // Due date and time
});

// ✅ Enforce unique assignment titles within the same class
assignmentSchema.index({ title: 1, className: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
