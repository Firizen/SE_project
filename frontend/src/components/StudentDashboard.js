import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // For View Details dropdown
  const navigate = useNavigate();

  const studentName = localStorage.getItem("studentName") || "Unknown";
  const studentEmail = localStorage.getItem("studentEmail") || "Not available";
  const studentClass = localStorage.getItem("studentClass") || "Not assigned";

  useEffect(() => {
    fetch(`http://localhost:5000/api/assignments/student/${studentClass}`)
      .then((res) => res.json())
      .then((data) => setAssignments(data));
  }, [studentClass]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentClass");
    navigate("/student/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold font-serif">Student Dashboard</h1>

        {/* View Details & Logout Buttons */}
        <div className="flex items-center space-x-4">
          {/* View Details Button with Hover */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
              className="bg-white text-black px-4 py-2 font-bold  rounded-md hover:bg-gray-300 transition"
            >
              View Details
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white text-black p-4 shadow-lg rounded-md"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <p className="font-semibold">Name: {studentName}</p>
                <p className="text-gray-600">Email: {studentEmail}</p>
                <p className="text-gray-600">Class: {studentClass}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-white text-1xl font-bold text-black px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Assignments Section */}
      <div className="max-w-5xl mx-auto py-10 px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Active Assignments</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-700">{assignment.title}</h3>
              <p className="text-gray-600">{assignment.description}</p>
              <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Teacher: {assignment.teacherId.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
