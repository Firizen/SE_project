const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");

// ✅ Models
const PastAssignment = require("./models/PastAssignment");
const PlagiarismResult = require("./models/PlagiarismResult");
const PlagiarismResultsAlt = require("./models/PlagiarismResultsAlt");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

// ✅ Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected successfully.");
    
    // ✅ Register Routes *after* DB connection is established
    registerRoutes();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Stop server if DB connection fails
  }
})();

// ✅ Function to Register Routes
function registerRoutes() {
  // Import Routes
  const assignmentRoutes = require("./routes/assignment");
  const authRoutes = require("./routes/auth");
  const studentRoutes = require("./routes/students");
  const submissionRoutes = require("./routes/submissions");
  const notificationRoutes = require("./routes/notifications");
  const appealRoutes = require("./routes/appealRoutes");
  const plagiarismRoutes = require("./routes/plagiarism");

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/assignments", assignmentRoutes);
  app.use("/api/submissions", submissionRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/appeals", appealRoutes);
  app.use("/api/plagiarism", plagiarismRoutes);


  // ✅ Fetch Similarity Scores
  app.get("/api/Similarity", async (req, res) => {
    try {
      const results = await PlagiarismResultsAlt.find({});
      res.json(results);
    } catch (err) {
      console.error("Error fetching similarity results:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // ✅ Fetch Past Assignments
  app.get("/api/pastassignments", async (req, res) => {
    try {
      const pastAssignments = await PastAssignment.find();
      res.json(pastAssignments);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch past assignments" });
    }
  });

  // ✅ Delete Past Assignment
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

  // ✅ WebSocket Connection
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });

    socket.on("error", (error) => {
      console.error("⚠️ Socket error:", error);
    });
  });

  // ✅ MongoDB Change Streams for Real-Time Updates
  mongoose.connection.once("open", () => {
    console.log("📡 Listening for database changes...");

    try {
      const db = mongoose.connection.db;

      // Watch Assignments
      watchCollection(db, "assignments", "assignmentsUpdated");

      // Watch Submissions
      watchCollection(db, "submissions", "submissionUpdate");

      // Watch Notifications
      watchCollection(db, "notifications", "newNotification");

    } catch (error) {
      console.error("⚠️ Error setting up change streams:", error);
    }
  });
}

// ✅ Function to Watch MongoDB Collections
function watchCollection(db, collectionName, eventName) {
  const stream = db.collection(collectionName).watch();

  stream.on("change", async (change) => {
    console.log(`📢 ${collectionName} updated:`, change);

    if (change.operationType === "update" || change.operationType === "insert") {
      const updatedData = await db.collection(collectionName).find().toArray();
      io.emit(eventName, { [collectionName]: updatedData });
    }
  });

  stream.on("error", (error) => {
    console.error(`⚠️ Error watching ${collectionName}:`, error);
    setTimeout(() => watchCollection(db, collectionName, eventName), 5000); // Reconnect after delay
  });
}

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
