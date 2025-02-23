import { useEffect, useState } from "react";

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

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

  return (
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
  );
};

export default ViewAssignments;
