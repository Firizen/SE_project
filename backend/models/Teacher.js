const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  plagiarismAlertsEnabled: { type: Boolean, default: true }, // ✅ Added field
});

module.exports = mongoose.model("Teacher", TeacherSchema);
