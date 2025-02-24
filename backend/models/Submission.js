const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  assignmentID: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  submittedAt: { type: Date, default: Date.now }
});

// Create a unique index to prevent duplicate submissions
submissionSchema.index({ studentID: 1, assignmentID: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
