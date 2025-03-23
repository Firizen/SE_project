import { render, screen, fireEvent } from "@testing-library/react";
import CreateAssignment from "../pages/teacher/dashboardComponents/CreateAssignment";
import React from "react";


global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Assignment Created Successfully!" }),
  })
);

beforeEach(() => {
  fetch.mockClear();
});

test("renders CreateAssignment form", () => {
  render(<CreateAssignment />);
  expect(screen.getByText("Create Assignment")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
  expect(screen.getByText("Enter Due Date:")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
});

test("shows error when required fields are missing", () => {
  render(<CreateAssignment />);
  fireEvent.click(screen.getByRole("button", { name: /create/i }));

  expect(screen.getByText("Title, Class Name, and Due Date are required.")).toBeInTheDocument();
});

test("submits form with valid inputs", async () => {
  render(<CreateAssignment />);

  fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "Math Assignment" } });
  fireEvent.change(screen.getByPlaceholderText("Description"), { target: { value: "Solve all exercises" } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "A" } });

  fireEvent.click(screen.getByRole("button", { name: /create/i }));


});
