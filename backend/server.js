const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Initialize Express app FIRST
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Import Routes
const assignmentRoutes = require("./routes/assignment");
const authRoutes = require("./routes/auth");

// Use Routes AFTER app initialization
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
