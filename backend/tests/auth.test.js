const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const bcrypt = require("bcrypt");

describe("Auth API Tests", () => {
  let studentEmail = "student@gmail.com";
  let studentPassword = "password123";
  let teacherEmail = "teacher@gmail.com";
  let teacherPassword = "securepassword";

  beforeEach(async () => {
    await mongoose.connection.dropDatabase(); 
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /** Student Signup Test */
  test("Should sign up a student", async () => {
    const res = await request(app).post("/api/auth/student-signup").send({
      name: "Test Student",
      email: studentEmail,
      password: studentPassword,
      studentClass: "A",
    });

    // console.log("Signup Response:", res.body);
    expect(res.statusCode).toBe(201);

    
    const student = await Student.findOne({ email: studentEmail });
    // console.log("Student in DB:", student);
    expect(student).not.toBeNull();
  });

  // Student Invalid MailID Signup Test 
  test("Should NOT sign up a student with invalid mailID", async () => {
    const res = await request(app).post("/api/auth/student-signup").send({
      name: "Test Student",
      email: "random@example.com",
      password: studentPassword,
      studentClass: "A",
    });

    // console.log("Signup Response:", res.body);
    expect(res.statusCode).toBe(400);

  });


  /** Student Login Test */
  test("Should log in a student", async () => {
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

    // console.log("Login Response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token"); // Ensure token is returned
    expect(res.body).toHaveProperty("student"); // Ensure student details are returned
    expect(res.body.student.email).toBe(studentEmail);
  });

  /** Student Login - Wrong Credentials */
  test("Should fail to log in a student with wrong password", async () => {
    const hashedPassword = await bcrypt.hash(studentPassword, 10);
    await Student.create({
      name: "Test Student",
      email: studentEmail,
      password: hashedPassword,
    });

    const res = await request(app).post("/api/auth/student-login").send({
      email: studentEmail,
      password: "wrongpassword",
    });

    // console.log("Wrong Password Login Response:", res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  /** Teacher Signup Test */
  test("Should sign up a teacher", async () => {
    const res = await request(app).post("/api/auth/teacher-signup").send({
      name: "Test Teacher",
      email: teacherEmail,
      password: teacherPassword,
    });

    // console.log("Teacher Signup Response:", res.body);
    expect(res.statusCode).toBe(201);

    // Verify if teacher is saved in the database
    const teacher = await Teacher.findOne({ email: teacherEmail });
    // console.log("Teacher in DB:", teacher);
    expect(teacher).not.toBeNull();
  });

  /** Teacher Signup Test */
  test("Should NOT sign up a teacher with invalid mailID", async () => {
    const res = await request(app).post("/api/auth/teacher-signup").send({
      name: "Test Teacher",
      email: "teacher@example.com",
      password: teacherPassword,
    });

    // console.log("Teacher Signup Response:", res.body);
    expect(res.statusCode).toBe(400);

  });


  /** Teacher Login Test */
  test("Should log in a teacher", async () => {
    // Manually create a teacher before testing login
    const hashedPassword = await bcrypt.hash(teacherPassword, 10);
    await Teacher.create({
      name: "Test Teacher",
      email: teacherEmail,
      password: hashedPassword,
    });

    const res = await request(app).post("/api/auth/teacher-login").send({
      email: teacherEmail,
      password: teacherPassword,
    });

    // console.log("Teacher Login Response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token"); 
    expect(res.body).toHaveProperty("teacher"); 
    expect(res.body.teacher.email).toBe(teacherEmail);
  });

  /** Teacher Login - Wrong Credentials */
  test("Should NOT log in a teacher with wrong password", async () => {
    const hashedPassword = await bcrypt.hash(teacherPassword, 10);
    await Teacher.create({
      name: "Test Teacher",
      email: teacherEmail,
      password: hashedPassword,
    });

    const res = await request(app).post("/api/auth/teacher-login").send({
      email: teacherEmail,
      password: "wrongpassword",
    });

    // console.log("Wrong Password Teacher Login Response:", res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });
});
