import { render, screen, fireEvent } from "@testing-library/react";
import TeacherLogin from "../pages/teacher/TeacherLogin";
import TeacherSignup from "../pages/teacher/TeacherSignup";
import StudentLogin from "../pages/student/StudentLogin";
import StudentSignup from "../pages/student/StudentSignup";
import React from "react";

jest.mock("axios");

global.fetch = jest.fn((url) =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        token: "mockToken",
        user:
          url.includes("teacher-login")
            ? { name: "Teacher A", email: "teacher@example.com" }
            : { _id: "123", name: "Student A", email: "student@example.com" },
      }),
  })
);

beforeEach(() => {
  fetch.mockClear();
  axios.post.mockClear();
});

describe("Authentication Tests", () => {
  test("renders Teacher login form", () => {
    render(<TeacherLogin />);
    expect(screen.getByText("Teacher Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("renders Teacher signup form", () => {
    render(<TeacherSignup />);
    expect(screen.getByText("Teacher Signup")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("renders Student login form", () => {
    render(<StudentLogin />);
    expect(screen.getByText("Student Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("renders Student signup form", () => {
    render(<StudentSignup />);
    expect(screen.getByText("Student Signup")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Class")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("shows error when Teacher login fields are empty", () => {
    render(<TeacherLogin />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Email and Password are required.")).toBeInTheDocument();
  });

  test("submits Teacher login form with valid data", async () => {
    render(<TeacherLogin />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teacher@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/api/auth/teacher-login", expect.any(Object));
  });

  test("submits Teacher signup form with valid data", async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(<TeacherSignup />);

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Teacher A" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teacher@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/api/auth/teacher-signup", {
      name: "Teacher A",
      email: "teacher@example.com",
      password: "password123",
    });
  });

  test("submits Student login form with valid data", async () => {
    render(<StudentLogin />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "student@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/api/auth/student-login", expect.any(Object));
  });

  test("submits Student signup form with valid data", async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(<StudentSignup />);

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Student A" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "student@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Class"), { target: { value: "10A" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/api/auth/student-signup", {
      name: "Student A",
      email: "student@example.com",
      password: "password123",
      studentClass: "10A",
    });
  });

  test("clears Teacher signup form when manually reset", () => {
    render(<TeacherSignup />);

    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(nameInput, { target: { value: "Teacher A" } });
    fireEvent.change(emailInput, { target: { value: "teacher@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "" } });

    expect(nameInput.value).toBe("");
    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });
});
