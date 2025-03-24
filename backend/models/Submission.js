const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  assignmentID: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  document: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "resubmitted", "graded"], default: "pending" },
  feedback: { type: String, default: "" },
  attempts: [
    {
      document: Buffer,
      contentType: String,
      timestamp: { type: Date, default: Date.now },
    }
  ]
});

// ❌ REMOVE index drop at runtime
// Submission.collection.dropIndexes().catch(err => {
//   console.log("No indexes to drop or already removed:", err);
// });

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
