// airesults.js
const express = require("express");
const router = express.Router();
const PlagiarismResult = require("../models/AIPlagiarismResult");
// ObjectId is likely no longer needed for this route if assignmentID is a String
// const { ObjectId } = require("mongodb"); // <-- Comment out or remove

// --- Route to fetch results by specific Assignment ID ---
router.get("/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId; // Get the ID as a string from the URL
    console.log(`🚀 Request received to fetch plagiarism results for Assignment ID: ${assignmentId}`);

    // --- MODIFICATION: Query directly using the String ID ---
    // Assuming assignmentID in your PlagiarismResult schema is of type String
    const query = { assignmentID: assignmentId }; // Use the string directly in the query

    console.log("🔍 Querying DB with (using string ID):", query);
    const results = await PlagiarismResult.find(query); // Find where the assignmentID string matches

    // Check if any results were found for this specific ID
    if (!results || results.length === 0) {
      console.log(`ℹ️ No plagiarism results found for Assignment ID (string): ${assignmentId}`);
      // Send 404 Not Found - the frontend expects this to show a message
      return res.status(404).json({ message: "No plagiarism results found for this assignment ID" });
    }

    console.log(`📊 Found ${results.length} results for Assignment ID: ${assignmentId}.`);
    console.log("✅ Successfully retrieved results by ID.");
    res.json(results); // Send the filtered results

  } catch (err) {
    // Generic error handling
    console.error(`❌ Error fetching plagiarism results for ID ${req.params.assignmentId}:`, err);
    res.status(500).json({ error: "Failed to fetch plagiarism results" });
  }
});

module.exports = router;