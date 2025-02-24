import { useState } from "react";
import ViewAssignments from "./dashboardComponents/ViewAssignments";

function StudentDashboard() {
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const studentName = localStorage.getItem("studentName") || "Unknown";
  const studentEmail = localStorage.getItem("studentEmail") || "Not available";
  const studentClass = localStorage.getItem("studentClass") || "Not available";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentClass");
    window.location.href = "/student/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="w-full bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold font-serif">Student Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
            <button className="bg-white text-black px-4 py-2 font-bold rounded-md hover:bg-gray-300 transition">
              View Details
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black p-4 shadow-lg rounded-md">
                <p className="font-semibold">Name: {studentName}</p>
                <p className="text-gray-600">Email: {studentEmail}</p>
                <p className="text-gray-600">Class: {studentClass}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="bg-white text-black font-bold px-4 py-2 rounded-md hover:bg-gray-300 transition">
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Layout */}
      <div className="flex flex-grow h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-4 h-full">
          <button
            onClick={() => setActiveSection(activeSection === "view" ? null : "view")}
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            View Active Assignments
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">{activeSection === "view" && <ViewAssignments />}</div>
      </div>
    </div>
  );
}

export default StudentDashboard;
