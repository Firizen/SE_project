import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import SubmissionStatus from "./SubmissionStatus"; // Import the new component

const socket = io("http://localhost:5000"); // Connect to WebSocket server

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const teacherName = JSON.parse(localStorage.getItem("teacherDetails"))?.name;

  useEffect(() => {
    if (!teacherName) return;

    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/assignments?teacherName=${encodeURIComponent(teacherName)}`
        );
        if (!response.ok) throw new Error("Failed to fetch assignments");

        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [teacherName]);

  return (
    <div className="flex space-x-6">
      {/* Show Assignments if No Selection */}
      {!selectedAssignment ? (
        <div className="bg-white p-6 rounded-lg shadow-lg w-10/12">
          <h2 className="text-xl font-semibold mb-4">My Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500">No assignments available.</p>
          ) : (
            <ul className="space-y-3">
              {assignments.map((assignment) => (
                <li key={assignment._id} className="p-4 border rounded-md shadow-sm bg-gray-50 flex justify-between items-center">
                  <div className="w-8/12">
                    <h3 className="text-lg font-bold text-black-600">Title: {assignment.title}</h3>
                    <p className="text-gray-600"><strong>Description:</strong> {assignment.description || "No description provided"}</p>
                    <p className="text-gray-600"><strong>Class:</strong> {assignment.className}</p>
                    <p className="text-gray-600"><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}</p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-md shadow bg-blue-500 hover:bg-blue-600 text-white w-2/12"
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    View Status
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <SubmissionStatus 
          assignment={selectedAssignment} 
          onBack={() => setSelectedAssignment(null)} 
          socket={socket} 
        />
      )}
    </div>
  );
};

export default ViewAssignments;
