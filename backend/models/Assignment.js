const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  className: { type: String, required: true }, // Class assigned to
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Assignment", assignmentSchema);
