const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  class: String,
});

module.exports = mongoose.model("Student", StudentSchema);
