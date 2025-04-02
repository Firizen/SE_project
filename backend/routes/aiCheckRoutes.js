const express = require("express");

const { downloadFiles}  = require("../controllers/aiCheckController");
const { runAI } = require("../controllers/aiCheckController");

const router = express.Router();

// Route to download files
router.get("/downloadFiles", downloadFiles);

// Route to run AI content check
router.post("/runAI", runAI);

module.exports = router;