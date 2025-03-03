import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import AppealStatus from "./AppealStatus"; // Appeal status component

const ViewAppeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const teacherDetails = JSON.parse(localStorage.getItem("teacherDetails") || "{}");
  const teacherName = teacherDetails?.name || "";

  useEffect(() => {
    if (!token) {
      setError("Unauthorized: Please log in again.");
      navigate("/teacher/login");
      return;
    }

    const fetchAppeals = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/appeals?teacherName=${encodeURIComponent(teacherName)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/teacher/login");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        setAppeals(data);
      } catch (error) {
        console.error("Error fetching appeals:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppeals();
  }, [teacherName, token, navigate]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("appeal-updated", (updatedAppeal) => {
      setAppeals((prevAppeals) =>
        prevAppeals.map((appeal) =>
          appeal._id === updatedAppeal._id ? updatedAppeal : appeal
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return <p className="text-gray-600">Loading appeals...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="flex space-x-6">
      {!selectedAppeal ? (
        <div className="bg-white p-6 rounded-lg shadow-lg w-10/12">
          <h2 className="text-xl font-semibold mb-4">Appeals</h2>
          {appeals.length === 0 ? (
            <p className="text-gray-500">No appeals available.</p>
          ) : (
            <ul className="space-y-3">
              {appeals.map((appeal) => (
                <li key={appeal._id} className="p-4 border rounded-md shadow-sm bg-gray-50 flex justify-between items-center">
                  <div className="w-8/12">
                    <h3 className="text-lg font-bold">Appeal Title: {appeal.title}</h3>
                    <p className="text-gray-600">
                      <strong>Student:</strong> {appeal.studentId?.name || "Unknown Student"}
                    </p>
                    <p className="text-gray-600"><strong>Assignment:</strong> {appeal.assignmentTitle}</p>
                    <p className="text-gray-600"><strong>Status:</strong> {appeal.status}</p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-md shadow bg-blue-500 hover:bg-blue-600 text-white w-2/12"
                    onClick={() => setSelectedAppeal(appeal)}
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <AppealStatus appeal={selectedAppeal} onBack={() => setSelectedAppeal(null)} />
      )}
    </div>
  );
};

export default ViewAppeals;
