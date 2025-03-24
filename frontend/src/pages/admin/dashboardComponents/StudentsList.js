import { useState, useCallback } from "react";

const StudentsList = ({onBack}) => {
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchStudents = useCallback(async () => {
    if (!className) {
      setError("Please enter a class name.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/students?className=${encodeURIComponent(className)}`
      );
      if (!response.ok) throw new Error("Failed to fetch students");

      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError("Error fetching students. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [className]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-10/12">
      <h2 className="text-xl font-semibold mb-4">Students List</h2>

      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          className="border p-2 rounded w-8/12"
          placeholder="Enter class name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          onClick={fetchStudents}
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading students...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {students.length > 0 && (
        <ul className="space-y-3">
          {students.map((student) => (
            <li key={student._id} className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h3 className="text-lg font-bold text-black-600">Name: {student.name}</h3>
              <p className="text-gray-600">Email: {student.email}</p>
              <p className="text-gray-600">Class: {student.studentClass}</p>
            </li>
          ))}
        </ul>
      )}
         {/* Back Button */}
         <div className="mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          onClick={onBack}
        >
          Back
        </button>
      </div>

    </div>
  );
};

export default StudentsList;
