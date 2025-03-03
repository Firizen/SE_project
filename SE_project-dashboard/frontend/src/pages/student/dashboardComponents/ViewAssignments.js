import { useState, useEffect } from "react";
import AssignmentDetails from "./AssignmentDetails"; // Import new component

function ViewStudentAssignments({ studentClass }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentClass) {
      fetch(`http://localhost:5000/api/assignments/student/${studentClass}`)
        .then((res) => res.json())
        .then((data) => setAssignments(data))
        .catch((err) => console.error("Error fetching assignments:", err));
    }
  }, [studentClass]);

  // Show AssignmentDetails if an assignment is selected
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
          {assignments.map((assignment) => (
            <li
              key={assignment._id}
              className="p-4 border rounded-md shadow-sm bg-white flex justify-between items-center"
            >
              <p className="text-gray-600 text-lg font-medium">
                <strong>Title: </strong> {assignment.title}
              </p>
              <button
                className="px-4 py-2 rounded-md shadow text-white bg-blue-500 hover:bg-blue-600"
                onClick={() => setSelectedAssignment(assignment)}
              >
                More Details
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ViewStudentAssignments;
