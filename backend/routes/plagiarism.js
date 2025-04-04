// routes/plagiarism.js
const express = require("express");
const router = express.Router();
const PlagiarismResult = require("../models/PlagiarismResult"); // Uses the updated model
const { Types: { ObjectId } } = require('mongoose');

router.get("/results", async (req, res) => {
    try {
        let { assignmentId, submissionID } = req.query;

        if (!assignmentId || !submissionID) { /* ... */ }

        console.log(`Backend Route: Received Assignment ID: ${assignmentId} (String)`);
        console.log(`Backend Route: Received Submission ID: ${submissionID} (String)`);

        // --- THIS CONVERSION PART IS ESSENTIAL ---
        let assignmentObjectId;
        let submissionObjectId;
        try {
            assignmentObjectId = new ObjectId(assignmentId);
            submissionObjectId = new ObjectId(submissionID);
            console.log(`Backend Route: Converted to ObjectId: assignment=${assignmentObjectId}, submission=${submissionObjectId}`);
        } catch (e) {
            console.error("Backend Route: Invalid ID format provided.", e);
            return res.status(400).json({ error: "Invalid ID format provided" });
        }
        // --- END CONVERSION ---

        console.log(`Backend Route: Querying PlagiarismResult.findOne with ObjectIds...`);
        // --- Query using the CONVERTED ObjectIds ---
        const result = await PlagiarismResult.findOne({
            assignmentID: assignmentObjectId, // Use ObjectId
            submissionID: submissionObjectId, // Use ObjectId
        });

        if (!result) { /* ... handle 404 ... */
             console.warn(`Backend Route: Mongoose findOne returned NULL for assignment ObjectId ${assignmentObjectId}, submission ObjectId ${submissionObjectId}`);
             return res.status(404).json({ message: `No plagiarism result found by API` });
        }

        console.log(`Backend Route: Mongoose findOne SUCCESS for ObjectIds. Returning result.`);
        res.json(result);

    } catch (error) { /* ... handle 500 ... */ }
});

module.exports = router;