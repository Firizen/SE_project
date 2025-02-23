import { useState, useEffect } from "react";

function ViewStudentAssignments({ studentClass }) {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (studentClass) {
      fetch(`http://localhost:5000/api/assignments/student/${studentClass}`)
        .then((res) => res.json())
        .then((data) => setAssignments(data))
        .catch((err) => console.error("Error fetching assignments:", err));
    }
  }, [studentClass]);

  return (
    <div className="p-8 w-full">
      <h2 className="text-xl font-semibold mb-4">Active Assignments</h2>
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments available.</p>
      ) : (
        <ul className="space-y-3">
          {assignments.map((assignment) => (
            <li key={assignment._id} className="p-4 border rounded-md shadow-sm bg-white">
              <h3 className="text-lg font-medium">{assignment.title}</h3>
              <p className="text-gray-600">{assignment.description}</p>
              <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ViewStudentAssignments;
