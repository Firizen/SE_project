import { useState, useEffect } from "react";
import axios from "axios";

const AppealStatus = ({ appeal, onBack, socket }) => {
  // ✅ Ensure appeal exists before setting state
  const [status, setStatus] = useState(appeal?.status || "Pending");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!appeal) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-10/12">
        <h2 className="text-xl font-semibold mb-4">Appeal Details</h2>
        <p className="text-gray-500">⚠ No appeal selected.</p>
        <button 
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Updating appeal status: ${appeal._id} → ${newStatus}`);

      // ✅ Add Authorization header
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Unauthorized: No token found.");
      }

      const response = await axios.put(
        `http://localhost:5000/api/appeals/${appeal._id}`, 
        { status: newStatus }, 
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      setStatus(newStatus);
      console.log(`✅ Appeal updated successfully: ${response.data.message}`);

      // ✅ Ensure socket exists before emitting
      if (socket) {
        socket.emit("updateAppealStatus", { appealId: appeal._id, newStatus });
        console.log("📡 WebSocket event emitted: updateAppealStatus");
      } else {
        console.warn("⚠ WebSocket (socket) is undefined, skipping emit.");
      }

    } catch (error) {
      console.error("🚨 Error updating appeal status:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to update appeal status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-10/12">
      <h2 className="text-xl font-semibold mb-4">Appeal Details</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <p><strong>Appeal Title:</strong> {appeal.assignmentTitle || "No Title"}</p>
        <p><strong>Student:</strong> {appeal.studentId?.name || "Unknown Student"}</p>
        <p><strong>Reason:</strong> {appeal.explanation || "No explanation provided"}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Submitted On:</strong> {appeal.submittedAt ? new Date(appeal.submittedAt).toLocaleString() : "Unknown Date"}</p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button 
          className={`px-4 py-2 rounded-md text-white ${status === "Reviewed" ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
          onClick={() => handleStatusChange("Reviewed")}
          disabled={loading || status === "Reviewed"}
        >
          {loading && status === "Reviewed" ? "Processing..." : "Approve"}
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-white ${status === "Rejected" ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
          onClick={() => handleStatusChange("Rejected")}
          disabled={loading || status === "Rejected"}
        >
          {loading && status === "Rejected" ? "Processing..." : "Reject"}
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
