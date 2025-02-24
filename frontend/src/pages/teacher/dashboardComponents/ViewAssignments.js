import { useState, useEffect } from "react";

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  const teacherName = JSON.parse(localStorage.getItem("teacherDetails"))?.name;

  useEffect(() => {
    if (!teacherName) return;

    const fetchAssignments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/assignments?teacherName=${encodeURIComponent(teacherName)}`);
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

  return (
    <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">My Assignments</h2>
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments available.</p>
      ) : (
        <ul className="space-y-3">
          {assignments.map((assignment) => (
            <li key={assignment._id} className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h3 className="text-lg font-medium">{assignment.title}</h3>
              <p className="text-gray-600"><strong>Description:</strong> {assignment.description || "No description provided"}</p>
              <p className="text-gray-600"><strong>Class:</strong> {assignment.className}</p>
              <p className="text-gray-600"><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewAssignments;
