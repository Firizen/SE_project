const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  submissionFileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, default: null },
  feedback: { type: String, default: "" }
});

module.exports = mongoose.model("Submission", submissionSchema);
