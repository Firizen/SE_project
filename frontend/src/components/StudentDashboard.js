import { useState, useEffect } from "react";

function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
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

  return (
    <div>
      <h1>Student Dashboard</h1>
      <h2>Active Assignments</h2>
      {assignments.map((assignment) => (
        <div key={assignment._id}>
          <h3>{assignment.title}</h3>
          <p>{assignment.description}</p>
          <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
          <p>Teacher: {assignment.teacherId.name}</p>
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <button onClick={() => handleSubmit(assignment._id)}>Submit</button>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;
