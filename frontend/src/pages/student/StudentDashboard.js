import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import ViewAssignments from "./dashboardComponents/ViewAssignments";
import AssignmentDetails from "./dashboardComponents/AssignmentDetails";
import SubmitAppeal from "./dashboardComponents/SubmitAppeal";

const socket = io("http://localhost:5000");

function StudentDashboard() {
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const student = {
    id: localStorage.getItem("studentID"),
    name: localStorage.getItem("studentName") || "Unknown",
    email: localStorage.getItem("studentEmail") || "Not Available",
    className: localStorage.getItem("studentClass") || "Not Available",
  };

  useEffect(() => {
    if (student.id) {
      fetchNotifications();
      socket.on("newNotification", (notification) => {
        if (notification.studentID === student.id) {
          setNotifications((prevNotifications) => [notification, ...prevNotifications]);
        }
      });
    }

    return () => {
      socket.off("newNotification");
    };
  }, [student.id]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${student.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationID) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-as-read/${notificationID}`);
      setNotifications(notifications.filter((n) => n._id !== notificationID));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const viewAssignmentDetails = async (assignmentID, notificationID) => {
    markAsRead(notificationID);
    try {
      const response = await axios.get(`http://localhost:5000/api/assignments/${assignmentID}`);
      setSelectedAssignment(response.data);
    } catch (error) {
      console.error("Error fetching assignment details:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentID");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentClass");
    window.location.href = "/student/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="w-full bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold font-serif">Student Dashboard</h1>
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
                <p className="font-semibold">Name: {student.name}</p>
                <p className="text-gray-600">Email: {student.email}</p>
                <p className="text-gray-600">Class: {student.className}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-grow">
        <div className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-4">
          <button
            onClick={() => {
              setSelectedAssignment(null);
              setActiveSection(activeSection === "view" ? null : "view");
            }}
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            View Active Assignments
          </button>
          <button
            onClick={() => {
              setSelectedAssignment(null);
              setActiveSection(activeSection === "appeal" ? null : "appeal");
            }}
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            Submit Appeal
          </button>
        </div>

        <div className="flex-1 p-8">
          {selectedAssignment ? (
            <AssignmentDetails assignment={selectedAssignment} resetSelection={() => setSelectedAssignment(null)} />
          ) : activeSection === "view" ? (
            <ViewAssignments studentClass={student.className} />
          ) : activeSection === "appeal" ? (
            <SubmitAppeal />
          ) : (
            <div className="flex content-start">
              <div className="bg-white p-6 rounded-lg shadow-lg w-8/12 mr-20">
                <h2 className="text-4xl font-semibold text-gray-700">Welcome, {student.name}!</h2>
                <div className="border-b-2 border-gray-300 w-10/12 mt-2"></div>
                <p className="text-gray-800 text-xl mt-6">Notifications:</p>
                <p className="text-gray-600">No new notifications.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
