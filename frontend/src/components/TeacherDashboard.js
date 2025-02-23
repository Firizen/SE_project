import { useEffect, useState } from "react";

function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const teacher = JSON.parse(localStorage.getItem("teacherDetails")) || { name: "Unknown", email: "Not Available" };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    fetch("http://localhost:5000/api/assignments")
      .then((res) => res.json())
      .then((data) => {
        setAssignments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching assignments:", err);
        setError("Failed to load assignments");
      });
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const newAssignment = { title, description, className };

    try {
      const response = await fetch("http://localhost:5000/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      });

      if (!response.ok) {
        throw new Error("Failed to create assignment");
      }

      setTitle("");
      setDescription("");
      setClassName("");
      fetchAssignments();
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError("Error creating assignment");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherDetails");
    window.location.href = "/teacher/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
          {activeSection === "create" && (
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-center">Create Assignment</h2>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">Create</button>
              </form>
            </div>
          )}

          {activeSection === "view" && (
            <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Assignments</h2>
              {error && <p className="text-red-500">{error}</p>}
              {assignments.length === 0 ? (
                <p className="text-gray-500">No assignments available.</p>
              ) : (
                <ul className="space-y-3">
                  {assignments.map((assignment, index) => (
                    <li key={index} className="p-4 border rounded-md shadow-sm bg-gray-50">
                      <h3 className="text-lg font-medium">{assignment.title}</h3>
                      <p className="text-gray-600">{assignment.className}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
