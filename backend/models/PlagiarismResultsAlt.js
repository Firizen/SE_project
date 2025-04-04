const mongoose = require('mongoose');

const PlagiarismResultSchema = new mongoose.Schema({
    submissionID: { type: String, required: true },
    student1: { type: String, required: true },
    student2: { type: String, required: true },
    similarity: { type: Number, required: true },
    highlightedText: { type: String }
}, { timestamps: true });

const PlagiarismResultsAlt = mongoose.model('PlagiarismResultsAlt', PlagiarismResultSchema);

module.exports = PlagiarismResultsAlt;
