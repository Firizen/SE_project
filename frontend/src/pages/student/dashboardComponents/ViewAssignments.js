import { useState, useEffect } from "react";

function ViewStudentAssignments({ studentClass }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState(null);
  const studentID = JSON.parse(localStorage.getItem("studentDetails"))?._id || null;

  useEffect(() => {
    if (studentClass) {
      fetch(`http://localhost:5000/api/assignments/student/${studentClass}`)
        .then((res) => res.json())
        .then((data) => setAssignments(data))
        .catch((err) => console.error("Error fetching assignments:", err));
    }
  }, [studentClass]);

  // Function to submit assignment
  const handleSubmit = async () => {
    const studentID = localStorage.getItem("studentID"); // ✅ Get Student ID
  
    if (!studentID) {
      alert("Student not logged in!");
      return;
    }
  
    const submissionData = {
      studentID: studentID, // Use the stored student ID
      assignmentID: selectedAssignment._id,
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit assignment");
      }
  
      alert("Assignment submitted successfully!");
    } catch (err) {
      console.error("Error submitting assignment:", err);
      alert("Submission failed!");
    }
  };
  

  return (
    <div className="p-8 flex space-x-8">
      {/* Active Assignments List */}
      <div className="w-5/12">
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
                  className={`w-3/12 px-4 py-2 rounded-md shadow text-white ${
                    selectedAssignment?._id === assignment._id
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
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
            <strong>Due Date:</strong> {new Date(selectedAssignment.dueDate).toLocaleString()}
          </p>
          <p className="text-gray-600">
            <strong>Id:</strong> {selectedAssignment?._id}
          </p>
          <button
            onClick={() => handleSubmit(selectedAssignment._id)}
            className="bg-blue-500 w-3/12 mt-10 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default ViewStudentAssignments;
