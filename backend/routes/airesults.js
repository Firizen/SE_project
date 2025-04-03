const express = require("express");
const router = express.Router();
const PlagiarismResult = require("../models/AIPlagiarismResult");
// ObjectId is no longer needed for THIS specific route handler
// const { ObjectId } = require("mongodb"); // <-- Commented out or remove if not used elsewhere in file

// --- MODIFIED ROUTE to fetch ALL results ---
// Changed path from "/:assignmentId" to "/"
router.get("/", async (req, res) => {
  try {
    // Log that we are fetching all results
    console.log("🚀 Request received to fetch ALL plagiarism results.");

    // MODIFICATION: Removed code related to req.params.assignmentId
    // const assignmentId = req.params.assignmentId;
    // let objectId;
    // try { objectId = ObjectId(assignmentId); ... } catch ...
    // console.log("🔍 Querying DB with:", { assignmentID: objectId });

    // MODIFICATION: Changed query to find({}) to fetch all documents
    console.log("🔍 Querying DB for ALL documents in PlagiarismResult collection.");
    const results = await PlagiarismResult.find({}); // Find ALL results
    console.log(`📊 Found ${results.length} plagiarism results.`);

    // MODIFICATION: Removed the 404 check specific to not finding results for *one* ID.
    // An empty array is a valid response for "find all".
    // if (results.length === 0) {
    //   console.log("❌ No plagiarism results found for:", assignmentId); // This log is no longer relevant
    //   return res.status(404).json({ error: "No plagiarism results found" });
    // }

    console.log("✅ Successfully retrieved all results.");
    // Send the results (which could be an empty array if the collection is empty)
    res.json(results);

  } catch (err) {
    // Keep generic error handling
    console.error("❌ Error fetching all plagiarism results:", err);
    res.status(500).json({ error: "Failed to fetch plagiarism results" });
  }
});


// --- ORIGINAL ROUTE (Optional: Keep if needed, maybe change path) ---
// If you still need the route to fetch by specific ID, you can keep it,
// BUT make sure its path is different or defined AFTER the general "/" route.
// For example, you could rename the original one:
/*
router.get("/by-assignment/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    console.log("📩 Received Assignment ID:", assignmentId);

    // You might need ObjectId again here if you uncomment this section
    const { ObjectId } = require("mongodb"); 

    let objectId;
    try {
      objectId = ObjectId(assignmentId);
      console.log("🆔 Converted to ObjectId:", objectId);
    } catch (error) {
      console.error("❌ Invalid ObjectId format:", assignmentId);
      return res.status(400).json({ error: "Invalid assignment ID format" });
    }

    console.log("🔍 Querying DB with:", { assignmentID: objectId });
    // Original query used objectId here, ensure your model expects ObjectId or string
    const results = await PlagiarismResult.find({ assignmentID : objectId }); // Use objectId

    if (!results || results.length === 0) { // Check if results is null or empty
      console.log("❌ No plagiarism results found for:", assignmentId);
      // Changed to send empty array with 404 or just message
      return res.status(404).json({ message: "No plagiarism results found for this assignment ID" });
    }

    console.log("📜 Query Results:", results);
    res.json(results);
  } catch (err) {
    console.error("Error fetching plagiarism results by ID:", err);
    res.status(500).json({ error: "Failed to fetch plagiarism results" });
  }
});
*/

module.exports = router;