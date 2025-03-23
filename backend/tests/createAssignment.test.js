const request = require("supertest");
const { app } = require("../server");
const Assignment = require("../models/Assignment");

describe("Assignment API", () => {
  afterEach(async () => {
    await Assignment.deleteMany(); // ✅ Clean up after each test
  });

  test("Should create an assignment successfully", async () => {
    const response = await request(app)
      .post("/api/assignments")
      .send({
        title: "Math Homework",
        description: "Algebra problems",
        className: "Class 10",
        teacherName: "Mr. Smith",
        dueDate: "2025-04-01",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe("Math Homework");
  });

  test("Should NOT allow duplicate assignment titles in the same class", async () => {
    const assignmentData = {
      title: "Math Homework",
      description: "Algebra problems",
      className: "Class 10",
      teacherName: "Mr. Smith",
      dueDate: "2025-04-01",
    };

    await request(app).post("/api/assignments").send(assignmentData);

    const duplicateResponse = await request(app).post("/api/assignments").send(assignmentData);

    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body.error).toBe("Assignment with the same title already exists in this class.");
  });
});
