const mongoose = require("mongoose");

const AIPlagiarismResultSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    perplexity: { type: Number, required: true },
    burstiness: { type: Number, required: true },
    ai_plagiarism_score: { type: Number, required: true },
    label: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PlagiarismResult", AIPlagiarismResultSchema);