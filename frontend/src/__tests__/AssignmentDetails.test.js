import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssignmentDetails from "../pages/student/dashboardComponents/AssignmentDetails";

test("renders AssignmentDetails correctly", () => {
  const mockAssignment = {
    _id: "123",
    title: "Sample Assignment",
  };

  render(<AssignmentDetails assignment={mockAssignment} />);
  expect(screen.getByText("Sample Assignment")).toBeInTheDocument();
});

test("displays 'No assignment selected' if no assignment is provided", () => {
  render(<AssignmentDetails assignment={null} />);
  expect(screen.getByText("No assignment selected")).toBeInTheDocument();
});

test("calls resetSelection when the back button is clicked", async () => {
  const mockAssignment = { _id: "123", title: "Sample Assignment" };
  const resetSelection = jest.fn();

  render(<AssignmentDetails assignment={mockAssignment} resetSelection={resetSelection} />);
  
  const backButton = screen.getByRole("button", { name: /back/i });
  await userEvent.click(backButton);

  expect(resetSelection).toHaveBeenCalledTimes(1);
});

test("matches snapshot", () => {
  const mockAssignment = { _id: "123", title: "Sample Assignment" };
  const { asFragment } = render(<AssignmentDetails assignment={mockAssignment} />);
  expect(asFragment()).toMatchSnapshot();
});
