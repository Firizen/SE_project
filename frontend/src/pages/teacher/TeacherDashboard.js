import { useState } from "react";
import CreateAssignment from "./dashboardComponents/CreateAssignment";
import ViewAssignments from "./dashboardComponents/ViewAssignments";
import ViewPastAssignments from "./dashboardComponents/PastAssignments";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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
          <div 
            className="relative" 
            onMouseEnter={() => setShowDropdown(true)} 
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="bg-white text-black px-4 py-2 font-semibold rounded-md hover:bg-gray-300 transition">
              View Details
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black p-4 shadow-lg rounded-md">
                <p className="font-semibold">Name: {teacher.name}</p>
                <p className="text-gray-600">Email: {teacher.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-white text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-300 transition">
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Layout */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 text-white flex flex-col p-4 space-y-4">
          <button 
            onClick={() => setActiveSection(activeSection === "create" ? null : "create")} 
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            Create Assignment
          </button>
          <button 
            onClick={() => setActiveSection(activeSection === "view" ? null : "view")} 
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            View Active Assignments
          </button>
          <button 
            onClick={() => setActiveSection(activeSection === "viewPast" ? null : "viewPast")} 
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            View Past Assignments
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 mt-4">
          {activeSection === "create" && <CreateAssignment />}
          {activeSection === "view" && <ViewAssignments />}
          {activeSection === "viewPast" && <ViewPastAssignments />}

          {/* Default Home Page */}
          {activeSection === null && (
  <div className="flex content-start">
     <div className="bg-white p-6 rounded-lg shadow-lg w-8/12 mr-20">
        <h2 className="text-4xl font-semibold text-gray-700">Welcome, {teacher.name}!</h2>
        <p className="text-gray-500 mt-2 mb-2">Manage your assignments efficiently from this dashboard.</p>
        <div className="border-b-2 border-gray-300 w-10/12 mt-2"></div>
        <p className="text-gray-800 text-xl mt-6">Announcements: </p>
  </div>
  <div className="mt-6 items-start">
    <Calendar className="shadow-lg rounded-md p-4 bg-white" />
  </div>
</div>

          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
