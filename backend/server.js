const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/assignments", require("./routes/assignment"));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
