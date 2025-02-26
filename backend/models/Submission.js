const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  assignmentID: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  document: { type: Buffer, required: true }, // Store document as binary data
  contentType: { type: String, required: true }, // Store file MIME type
  submittedAt: { type: Date, default: Date.now }
});

// Unique index to prevent duplicate submissions
submissionSchema.index({ studentID: 1, assignmentID: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
