const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { spawn } = require("child_process");
require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

// ✅ Connect to MongoDB
connectDB().then(() => console.log("✅ MongoDB Connected"));

// ✅ Import Routes
const assignmentRoutes = require("./routes/assignment");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const submissionRoutes = require("./routes/submissions");
const notificationRoutes = require("./routes/notifications");

const PastAssignment = require("./models/PastAssignment");
const appealRoutes = require("./routes/appealRoutes"); // Import appeal routes
const teacherRoutes=require("./routes/teachers");
const aiCheckRoutes = require("./routes/aiCheckRoutes");
const airesults = require("./routes/airesults");



// ✅ API Route for past assignments
app.get("/api/pastassignments", async (req, res) => {
  try {
    const pastAssignments = await PastAssignment.find();
    res.json(pastAssignments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch past assignments" });
  }
});

app.delete("/api/pastassignments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAssignment = await PastAssignment.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Emit real-time update to clients
    io.emit("assignmentDeleted", { id });

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assignment", error: error.message });
  }
});

app.use((req, res, next) => {
  console.log(`📥 Received request: ${req.method} ${req.url}`);
  next();
});

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appeals", appealRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/ai-check", aiCheckRoutes);
app.use("/api/plagiarism-results", airesults);

// ✅ Function to Run Similarity Check
const runSimilarityCheck = () => {
  return new Promise((resolve, reject) => {
    console.log("🚀 Running similarity.py script...");

    const process = spawn("python3", ["similarity.py"]);
    let result = "";
    let errorData = "";

    process.stdout.on("data", (data) => {
      console.log("📄 Output from similarity.py:", data.toString());
      result += data.toString();
    });

    process.stderr.on("data", (data) => {
      console.error("❌ Error in similarity.py:", data.toString());
      errorData += data.toString();
    });

    process.on("close", async (code) => {
      if (code === 0) {
        try {
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (error) {
          reject(new Error("❌ JSON Parsing Error: " + error.message));
        }
      } else {
        reject(new Error("❌ similarity.py exited with code: " + code + " | Error: " + errorData));
      }
    });
  });
};


// ✅ API to Run Similarity Check and Store Results
app.post("/api/similarity", async (req, res) => {
  try {
    console.log("🔍 API received similarity check request...");

    const results = await runSimilarityCheck();

    if (!results.results || results.results.length === 0) {
      return res.status(500).json({ error: "⚠️ No similarity results returned." });
    }

    // Store results in MongoDB (studentPortal.plagiarismresults)
    const similarityCollection = mongoose.connection.collection("plagiarismresults");

    // Insert each result separately to prevent duplication errors
    for (const result of results.results) {
      await similarityCollection.updateOne(
        { submissionID: result.submissionID }, // Prevent duplicate entries
        { $set: result },
        { upsert: true }
      );
    }

    console.log("✅ Results saved to database.");
    res.json(results.results);
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ API to Fetch Plagiarism Results (for Admin Dashboard)
app.get("/api/plagiarism-results", async (req, res) => {
  try {
    const similarityCollection = mongoose.connection.collection("plagiarismresults");

    // ✅ Fetch required fields including highlighted text
    const results = await similarityCollection
      .find({}, { projection: { _id: 0, submissionID: 1, "Student 1": 1, "Student 2": 1, "Similarity (%)": 1, "Highlighted Text": 1 } })
      .toArray();

    console.log("📊 Fetched plagiarism results.");
    io.emit("fetchedDocuments", "Fetched Documents"); // Send event to frontend
    res.json({ results });
  } catch (error) {
    console.error("❌ Error fetching plagiarism results:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));