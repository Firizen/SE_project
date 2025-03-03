import { useState } from "react";

const AppealStatus = ({ appeal, onBack, socket }) => {
  const [status, setStatus] = useState(appeal.status);
  const [error, setError] = useState(null);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appeals/${appeal._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setStatus(newStatus);
      socket.emit("updateAppealStatus", { appealId: appeal._id, newStatus }); // Notify clients
    } catch (error) {
      console.error("Error updating appeal status:", error);
      setError("Failed to update appeal status. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-10/12">
      <h2 className="text-xl font-semibold mb-4">Appeal Details</h2>
      
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <p><strong>Appeal Title:</strong> {appeal.title || "Untitled Appeal"}</p>
        <p><strong>Student:</strong> {appeal.studentId?.name || "Unknown Student"}</p>
        <p><strong>Assignment:</strong> {appeal.assignmentTitle || "No Assignment Name"}</p>
        <p><strong>Reason:</strong> {appeal.explanation || "No explanation provided"}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Submitted On:</strong> {appeal.submittedAt ? new Date(appeal.submittedAt).toLocaleString() : "Unknown Date"}</p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          onClick={() => handleStatusChange("Approved")}
        >
          Approve
        </button>
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => handleStatusChange("Rejected")}
        >
          Reject
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default AppealStatus;
