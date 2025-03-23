const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const bcrypt = require("bcrypt");

describe("Auth API Tests", () => {
  let studentEmail = "student@example.com";
  let studentPassword = "password123";

  beforeEach(async () => {
    await mongoose.connection.dropDatabase(); // Ensure a clean database before each test
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Should sign up a student", async () => {
    const res = await request(app).post("/api/auth/student-signup").send({
      name: "Test Student",
      email: studentEmail,
      password: studentPassword,
    });

    console.log("Signup Response:", res.body);

    expect(res.statusCode).toBe(201);
    
    // Verify if student is saved in the database
    const student = await Student.findOne({ email: studentEmail });
    console.log("Student in DB:", student);
    expect(student).not.toBeNull();
  });

  test("Should log in a student", async () => {
    // Manually create a student before testing login
    const hashedPassword = await bcrypt.hash(studentPassword, 10);
    await Student.create({
      name: "Test Student",
      email: studentEmail,
      password: hashedPassword,
    });

    const res = await request(app).post("/api/auth/student-login").send({
      email: studentEmail,
      password: studentPassword,
    });

    console.log("Login Response:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token"); // Ensure token is returned
    expect(res.body).toHaveProperty("student"); // Ensure student details are returned
    expect(res.body.student.email).toBe(studentEmail);
  });
});
