import { useState } from "react";
import CreateAssignment from "./dashboardComponents/CreateAssignment";
import ViewAssignments from "./dashboardComponents/ViewAssignments";

function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const teacher = JSON.parse(localStorage.getItem("teacherDetails")) || { name: "Unknown", email: "Not Available" };

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherDetails");
    window.location.href = "/teacher/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="w-full bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold font-serif">Teacher Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
            <button className="bg-white text-black px-4 py-2 font-bold rounded-md hover:bg-gray-300 transition">
              View Details
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black p-4 shadow-lg rounded-md">
                <p className="font-semibold">Name: {teacher.name}</p>
                <p className="text-gray-600">Email: {teacher.email}</p>
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
        <div className="w-80 bg-gray-800 text-white flex flex-col p-4 space-y-4 h-full">
          <button onClick={() => setActiveSection("create")} className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition">
            Create Assignment
          </button>
          <button onClick={() => setActiveSection("view")} className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition">
            View Active Assignments
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {activeSection === "create" && <CreateAssignment />}
          {activeSection === "view" && <ViewAssignments />}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
