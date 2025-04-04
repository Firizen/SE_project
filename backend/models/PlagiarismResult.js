const mongoose = require("mongoose");

const AIPlagiarismResultSchema = new mongoose.Schema({
    submissionID: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true, unique: true },
    assignmentID : { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true},
    filename: { type: String, required: true },
    perplexity: { type: Number, required: true },
    burstiness: { type: Number, required: true },
    ai_plagiarism_score: { type: Number, required: true },
    label: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
} , {
    timestamps: true,
    // --- ADD THIS OPTION ---
    collection: 'plagiarism_results' // Explicitly specify the correct collection name
    // --- END ADDITION ---
});

const PlagiarismResult = mongoose.model("PlagiarismResult", AIPlagiarismResultSchema);
module.exports = PlagiarismResult;
