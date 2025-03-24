const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
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

// Connect to MongoDB
connectDB();

// Import Routes
const assignmentRoutes = require("./routes/assignment");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const submissionRoutes = require("./routes/submissions"); // ✅ Ensure this route is correctly registered
const notificationRoutes = require("./routes/notifications");
const PastAssignment = require("./models/PastAssignment");
const appealRoutes = require("./routes/appealRoutes"); // Import appeal routes
const teacherRoutes=require("./routes/teachers");
const aiCheckRoutes = require("./routes/aiCheckRoutes");



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
app.use("/api/submissions", submissionRoutes); // ✅ Ensure this is correctly registered
app.use("/api/students", studentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appeals", appealRoutes); // Register appeal routes
app.use("/api/teachers", teacherRoutes);
app.use("/api/ai-check", aiCheckRoutes);



// WebSocket Connection
io.on("connection", (socket) => {
  console.log("🔗 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// MongoDB Change Streams
const db = mongoose.connection;
db.once("open", () => {
  console.log("📡 Listening for database changes...");

  const assignmentCollection = db.collection("assignments");
  const assignmentStream = assignmentCollection.watch();

  assignmentStream.on("change", async (change) => {
    console.log("📢 Assignment updated:", change);
    const updatedAssignments = await assignmentCollection.find().toArray();
    io.emit("assignmentsUpdated", { assignments: updatedAssignments });
  });

  const submissionCollection = db.collection("submissions");
  const submissionStream = submissionCollection.watch();

  submissionStream.on("change", (change) => {
    console.log("📢 Submission updated:", change);
    io.emit("submissionUpdate", change);
  });

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
