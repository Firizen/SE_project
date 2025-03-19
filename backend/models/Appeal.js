const mongoose = require("mongoose");

const AppealSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  assignmentTitle: { type: String, required: true }, 
  explanation: { type: String, required: true },
  evidence: { type: String }, 
  status: { type: String, enum: ["Pending", "Reviewed", "Rejected"], default: "Pending" },  // ✅ Ensure consistency
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appeal", AppealSchema);
