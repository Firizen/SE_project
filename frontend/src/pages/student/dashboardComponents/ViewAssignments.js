import { useState, useEffect } from "react";
import { io } from "socket.io-client"; // Import socket.io client
import AssignmentDetails from "./AssignmentDetails";

const socket = io("http://localhost:5000"); // Connect to backend Socket.IO server

function ViewStudentAssignments({ studentClass }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentClass) return;

    // Fetch initial assignments from server
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/assignments/student/${studentClass}`);
        if (!response.ok) throw new Error("Failed to fetch assignments");
        
        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAssignments();

    // Listen for real-time assignment updates and filter based on studentClass
    const handleAssignmentsUpdate = (updatedAssignments) => {
      const filteredAssignments = updatedAssignments.assignments.filter(
        (assignment) => assignment.className === studentClass
      );
      setAssignments(filteredAssignments);
    };

    socket.on("assignmentsUpdated", handleAssignmentsUpdate);

    return () => {
      socket.off("assignmentsUpdated", handleAssignmentsUpdate); // Clean up listener on unmount
    };
  }, [studentClass]);

  if (selectedAssignment) {
    return (
      <AssignmentDetails
        assignment={selectedAssignment}
        resetSelection={() => setSelectedAssignment(null)}
      />
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Active Assignments</h2>
      {error && <p className="text-red-500">{error}</p>}
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments available.</p>
      ) : (
        <ul className="space-y-3">
          {assignments.map((assignment) => {
            const isOverdue = new Date(assignment.dueDate) < new Date();

            return (
              <li
                key={assignment._id}
                className={`p-4 border rounded-md shadow-sm flex justify-between items-center 
                  ${isOverdue ? "bg-red-100 border-red-500" : "bg-white"}`}
              >
                <div>
                  <p className="text-gray-600 text-lg font-medium">
                    <strong>Title: </strong> {assignment.title}
                  </p>
                  {isOverdue && (
                    <p className="text-red-600 font-semibold">Overdue</p>
                  )}
                  <p className="text-gray-500">
                    <strong>Due: </strong> {new Date(assignment.dueDate).toLocaleString()}
                  </p>
                </div>
                <button
                  className="px-4 py-2 rounded-md shadow text-white bg-blue-500 hover:bg-blue-600"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  More Details
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ViewStudentAssignments;
