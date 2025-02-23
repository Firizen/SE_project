const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  studentClass: String,
});

module.exports = mongoose.model("Student", StudentSchema);
