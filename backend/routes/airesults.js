const express = require("express");
const router = express.Router();
const PlagiarismResult = require("../models/AIPlagiarismResult");
const { ObjectId } = require('mongoose').Types;

router.get("/:submissionId", async (req, res) => {
    try {
        const submissionId = req.params.submissionId;
        console.log("📩 Received Submission ID:", submissionId);

        let objectId
        try {
        objectId = new ObjectId(submissionId);
        console.log("🆔 Converted to ObjectId:", objectId);
        }
        catch(error){
            console.error("❌ Invalid ObjectId format:", submissionId);
            return res.status(400).json({ error: "Invalid submission ID format" });

        }


        const result = await PlagiarismResult.findOne({ submissionID: objectId });
        console.log("📜 Query Result:", result);
  
      if (!result) {
        console.log("❌ No plagiarism result found for:", submissionId);
        return res.status(404).json({ error: "Plagiarism result not found" });
      }
  
      res.json(result);
    } catch (err) {
      console.error("Error fetching plagiarism result:", err);
      res.status(500).json({ error: "Failed to fetch plagiarism result" });
    }
  });

module.exports = router;