import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SubmissionStatus from "../pages/teacher/dashboardComponents/SubmissionStatus";
import React from "react";
import { io } from "socket.io-client";

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  })),
}));

global.fetch = jest.fn();

const mockAssignment = {
  _id: "assignment123",
  title: "Math Homework",
  className: "Class A",
};

const mockStudents = [
  { _id: "student1", name: "Alice" },
  { _id: "student2", name: "Bob" },
];

const mockSubmissions = [{ studentID: "student1" }];

describe("SubmissionStatus Component", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders submission status correctly", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/api/students")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
      }
      if (url.includes("/api/submissions")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSubmissions) });
      }
      return Promise.reject(new Error("Unknown API call"));
    });

    render(<SubmissionStatus assignment={mockAssignment} socket={io()} onBack={jest.fn()} />);

    expect(screen.getByText("Submission Status: Math Homework")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument(); // Submitted student
      expect(screen.getByText(/Bob/i)).toBeInTheDocument(); // Not submitted
    });
  });

  test("handles document fetch and preview", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/api/students")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
      }
      if (url.includes("/api/submissions")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSubmissions) });
      }
      if (url.includes("/api/submissions/document")) {
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(["dummy content"], { type: "application/pdf" })),
          headers: { get: () => "application/pdf" },
        });
      }
      return Promise.reject(new Error("Unknown API call"));
    });

    render(<SubmissionStatus assignment={mockAssignment} socket={io()} onBack={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    });

    const viewButton = await screen.findByText(/View Submission/i);
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText(/View Submission/i)).toBeInTheDocument();
    });
  });
});
