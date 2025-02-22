import { useEffect, useState } from "react";

function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]); // Stores assignments
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    fetch("http://localhost:5000/api/assignments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAssignments(data);
        } else {
          setAssignments([]);
        }
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
      fetchAssignments(); // Refresh the list after adding
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError("Error creating assignment");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    window.location.href = "/"; // Redirect to home
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Create Assignment</h2>
      <form onSubmit={handleCreateAssignment}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="text" placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} required />
        <button type="submit">Create</button>
      </form>

      <h2>Assignments</h2>
      {error && <p>Error: {error}</p>}
      {assignments.length === 0 ? (
        <p>No assignments available.</p>
      ) : (
        <ul>
          {assignments.map((assignment, index) => (
            <li key={index}>{assignment.title} - {assignment.className}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeacherDashboard;
