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
const appealRoutes = require("./routes/appealRoutes"); // Import appeal routes

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/appeals", appealRoutes); // Register appeal routes

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
  console.log("📡 Listening for submission changes...");
  const submissionCollection = db.collection("submissions");
  const appealCollection = db.collection("appeals");

  const submissionChangeStream = submissionCollection.watch();
  submissionChangeStream.on("change", (change) => {
    console.log("📢 Submission updated:", change);
    io.emit("submissionUpdate", change);
  });

  // MongoDB Change Stream for appeal updates
  const appealChangeStream = appealCollection.watch();
  appealChangeStream.on("change", (change) => {
    console.log("📢 New appeal submitted:", change);
    io.emit("appealNotification", { message: "A new appeal has been submitted." });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));