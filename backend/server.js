const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as per your frontend's URL
    methods: ["GET", "POST", "DELETE"] // Allow DELETE requests
  }
});

// Connect to MongoDB
connectDB();

// Import Routes
const assignmentRoutes = require("./routes/assignment");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const submissionRoutes = require("./routes/submissions");
const notificationRoutes = require("./routes/notifications");
const PastAssignment = require("./models/PastAssignment"); // Import the model

// 🟢 Get all past assignments
app.get("/api/pastassignments", async (req, res) => {
  try {
    const pastAssignments = await PastAssignment.find(); // Fetch from database
    res.json(pastAssignments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch past assignments" });
  }
});

// 🔴 DELETE route to remove a past assignment
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

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/notifications", notificationRoutes);

// WebSocket connection
io.on("connection", (socket) => {
  console.log("🔗 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// MongoDB Change Stream for real-time updates
const db = mongoose.connection;
db.once("open", () => {
  console.log("📡 Listening for database changes...");

  // 🔹 Assignment Change Stream for Real-Time Updates
  const assignmentCollection = db.collection("assignments");
  const assignmentStream = assignmentCollection.watch();

  assignmentStream.on("change", async (change) => {
    console.log("📢 Assignment updated:", change);
    const updatedAssignments = await assignmentCollection.find().toArray();
    io.emit("assignmentsUpdated", { assignments: updatedAssignments });
  });

  // 🔹 Submission Change Stream
  const submissionCollection = db.collection("submissions");
  const submissionStream = submissionCollection.watch();

  submissionStream.on("change", (change) => {
    console.log("📢 Submission updated:", change);
    io.emit("submissionUpdate", change);
  });

  // 🔹 Notification Change Stream
  const notificationCollection = db.collection("notifications");
  const notificationStream = notificationCollection.watch();

  notificationStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const newNotification = change.fullDocument;
      console.log("🔔 New Notification:", newNotification);
      io.emit("newNotification", newNotification);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
