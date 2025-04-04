import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Trash2 } from "lucide-react"; // Import a delete icon

const socket = io("http://localhost:5000");

function ViewPastAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPastAssignments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/pastassignments");
        if (!response.ok) throw new Error("Failed to fetch past assignments");
        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPastAssignments();

    // Listen for real-time deletion events
    socket.on("assignmentDeleted", ({ id }) => {
      setAssignments((prev) => prev.filter((assignment) => assignment._id !== id));
    });

    return () => {
      socket.off("assignmentDeleted");
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pastassignments/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete assignment");

      // Remove the assignment from state (real-time update will also handle it)
      setAssignments(assignments.filter((assignment) => assignment._id !== id));
    } catch (err) {
      alert("Error deleting assignment: " + err.message);
    }
  };

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
          <div key={assignment._id} className="border rounded-lg p-4 shadow-md bg-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Title: {assignment.title}</h3>
              {assignment.description && assignment.description !== assignment.title && (
                <p className="text-sm text-gray-600">Description: {assignment.description}</p>
              )}
              <p className="text-sm text-gray-500">Class: {assignment.className}</p>
              <p className="text-sm text-gray-500">Assigned by: {assignment.teacherName}</p>
              <p className="text-sm text-gray-500">Due Date: {new Date(assignment.dueDate).toLocaleString()}</p>
            </div>
            
            {/* Delete Icon */}
            <button onClick={() => handleDelete(assignment._id)} className="text-red-500 hover:text-red-700">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewPastAssignments;
