import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ViewPlagiarismResults() {
  const [assignments, setAssignments] = useState([]);
  const teacher = JSON.parse(localStorage.getItem("teacherDetails")) || { name: "Unknown" };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/assignments?teacherName=${encodeURIComponent(teacher.name)}`);
       
        const data = await response.json();
        setAssignments(data);
      }
       catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [teacher.name]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Assignments</h2>


      {assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <ul className="space-y-4">
          {assignments.map((assignment) => (
            <li key={assignment._id} className="p-4 bg-gray-200 rounded-lg flex justify-between items-center">
              <span className="text-lg font-semibold">{assignment.title}</span>
              <button
                onClick={() => navigate(`/aiplagiarism-results`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
              >
                View Results
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ViewPlagiarismResults;
