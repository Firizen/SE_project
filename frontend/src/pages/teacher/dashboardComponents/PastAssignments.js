import { useState, useEffect } from "react";

function ViewPastAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/assignments");
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const data = await response.json();

        // Filter past assignments (where due date is in the past)
        const pastAssignments = data.filter((assignment) => 
          new Date(assignment.dueDate) < new Date()
        );

        setAssignments(pastAssignments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Past Assignments</h2>

      {loading && <p className="text-gray-500 text-center">Loading assignments...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && assignments.length === 0 && (
        <p className="text-gray-500 text-center">No past assignments found.</p>
      )}

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment._id} className="border rounded-lg p-4 shadow-md bg-gray-100">
            <h3 className="text-lg font-semibold text-gray-700">{assignment.title}</h3>
            <p className="text-gray-600">{assignment.description || "No description provided"}</p>
            <p className="text-sm text-gray-500">Class: {assignment.className}</p>
            <p className="text-sm text-gray-500">Assigned by: {assignment.teacherName}</p>
            <p className="text-sm text-gray-500">
              Due Date: {new Date(assignment.dueDate).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewPastAssignments;
