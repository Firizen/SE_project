import { useState, useEffect } from "react";

function ViewStudentAssignments({ studentClass }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null); // Stores selected assignment details

  useEffect(() => {
    if (studentClass) {
      fetch(`http://localhost:5000/api/assignments/student/${studentClass}`)
        .then((res) => res.json())
        .then((data) => setAssignments(data))
        .catch((err) => console.error("Error fetching assignments:", err));
    }
  }, [studentClass]);

  return (
    <div className="p-8 flex space-x-8">
      {/* Active Assignments List */}
      <div className="w-5/12">
        <h2 className="text-xl font-semibold mb-4">Active Assignments</h2>
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
                  className={`w-3/12 px-4 py-2 rounded-md shadow text-white ${
                    selectedAssignment?._id === assignment._id
                      ? "bg-red-500 hover:bg-red-600" // Red when active
                      : "bg-blue-500 hover:bg-blue-600" // Blue when inactive
                  }`}
                  onClick={() =>
                    setSelectedAssignment(
                      selectedAssignment?._id === assignment._id ? null : assignment
                    )
                  }
                >
                  {selectedAssignment?._id === assignment._id
                    ? "Hide Details"
                    : "More Details"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assignment Details Display */}
      {selectedAssignment && (
        <div className="w-6/12 p-4 border rounded-md shadow-sm bg-white">
          <h3 className="text-xl font-semibold mb-4">
            Title: {selectedAssignment.title}
          </h3>
          <p className="text-gray-600">
            <strong>Created by:</strong> {selectedAssignment.teacherName || "Unknown"}
          </p>
          <p className="text-gray-600">
            <strong>Description:</strong> {selectedAssignment.description}
          </p>
          <p className="text-gray-600">
            <strong>Due Date:</strong>{" "}
            {new Date(selectedAssignment.dueDate).toLocaleString()}
          </p>
          <p className="text-gray-600">
            <strong>Id:</strong>  {selectedAssignment?._id}
          </p>
          <button className="bg-blue-500 w-3/12 mt-10 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600">
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default ViewStudentAssignments;
