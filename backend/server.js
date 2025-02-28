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
    methods: ["GET", "POST"]
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

app.get("/api/pastassignments", async (req, res) => {
  try {
    const pastAssignments = await PastAssignment.find(); // Fetch from database
    res.json(pastAssignments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch past assignments" });
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

// MongoDB Change Stream for real-time submission updates
const db = mongoose.connection;
db.once("open", () => {
  console.log("📡 Listening for database changes...");

  // Submission Change Stream
  const submissionCollection = db.collection("submissions");
  const submissionStream = submissionCollection.watch();

  submissionStream.on("change", (change) => {
    console.log("📢 Submission updated:", change);
    io.emit("submissionUpdate", change);
  });

  // Notification Change Stream
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
