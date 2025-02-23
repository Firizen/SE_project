import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const studentId = "STUDENT_ID"; // Replace with actual logged-in student's ID

  useEffect(() => {
    fetch("http://localhost:5000/api/assignments/student/CLASS_NAME")
      .then((res) => res.json())
      .then((data) => setAssignments(data));
  }, []);

  const handleSubmit = async (assignmentId) => {
    if (!selectedFile) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://localhost:5000/api/assignments/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, assignmentId, fileUrl: "uploaded-file-url" }),
    });

    if (response.ok) alert("Assignment Submitted!");
  };

  const handleLogout = () => {
    // Clear session and navigate to login page
    localStorage.removeItem("token");
    navigate("/student/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-1xl font-bold text-black px-4 py-2 rounded-md hover:bg-gray-300 transition"
        ></button>
      </header>

      <div className="max-w-5xl mx-auto py-10 px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Active Assignments</h2>

        {/* Grid Layout for Assignments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-700">{assignment.title}</h3>
              <p className="text-gray-600">{assignment.description}</p>
              <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Teacher: {assignment.teacherId.name}</p>

              {/* File Upload & Submit */}
              <div className="mt-4">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full border border-gray-300 p-2 rounded-md"
                />
                <button
                  onClick={() => handleSubmit(assignment._id)}
                  className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Submit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
