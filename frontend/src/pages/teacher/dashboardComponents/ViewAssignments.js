import { useState, useEffect } from "react";

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);

  const teacherName = JSON.parse(localStorage.getItem("teacherDetails"))?.name;

  useEffect(() => {
    if (!teacherName) return;

    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/assignments?teacherName=${encodeURIComponent(teacherName)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [teacherName]);

  const handleViewStatus = async (assignmentId, className) => {
    // If the same assignment is clicked again, hide the status
    if (selectedAssignment === assignmentId) {
      setSelectedAssignment(null);
      setStudents([]);
      return;
    }

    try {
      console.log("Fetching students for class:", className);

      // Fetch students of the selected class
      const response = await fetch(
        `http://localhost:5000/api/students?className=${encodeURIComponent(className)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student details");
      }

      const data = await response.json();
      console.log("Fetched students:", data);

      setStudents(data);
      setSelectedAssignment(assignmentId);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  return (
    <div className="flex space-x-6">
      {/* Assignment List */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-5/12 h-5/6">
        <h2 className="text-xl font-semibold mb-4">My Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments available.</p>
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => (
              <li
                key={assignment._id}
                className="p-4 border rounded-md shadow-sm bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-black-600">
                    Title: {assignment.title}
                  </h3>
                  <p className="text-gray-600">
                    <strong>Description:</strong>{" "}
                    {assignment.description || "No description provided"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Class:</strong> {assignment.className}
                  </p>
                  <p className="text-gray-600">
                    <strong>Due Date:</strong>{" "}
                    {new Date(assignment.dueDate).toLocaleString()}
                  </p>
                </div>
                <button
                  className={`px-4 py-2 rounded-md shadow ${
                    selectedAssignment === assignment._id
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  onClick={() => handleViewStatus(assignment._id, assignment.className)}
                >
                  {selectedAssignment === assignment._id ? "Hide Status" : "View Status"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Student Details */}
      {selectedAssignment && students.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-6/12 h-5/6">
          <h2 className="text-xl font-semibold mb-4">Students in Class</h2>
          <ul className="space-y-3">
            {students.map((student) => (
              <li key={student._id} className="p-4 border rounded-md shadow-sm bg-gray-50">
                <p className="text-gray-600">
                  <strong>Name:</strong> {student.name}
                </p>
                <p className="text-gray-600">
                  <strong>Email:</strong> {student.email}
                </p>
                <p className="text-gray-600">
                  <strong>Class:</strong> {student.studentClass}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewAssignments;
