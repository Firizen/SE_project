const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Initialize Express app
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Import Routes
const assignmentRoutes = require("./routes/assignment");
const authRoutes = require("./routes/auth");
const submissionRoutes = require("./routes/submissionRoutes"); // ✅ Import Submission Routes
const studentRoutes = require("./routes/students");
// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes); // ✅ Add Submission Routes
app.use("/api/students", studentRoutes);


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
