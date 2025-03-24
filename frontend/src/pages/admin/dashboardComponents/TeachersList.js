import { useState, useEffect } from "react";

const TeachersList = ({ onBack }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/teachers");
        if (!response.ok) throw new Error("Failed to fetch teachers");
        
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setError("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-10/12 mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Teachers List</h2>
      {loading && <p>Loading teachers...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <ul className="space-y-3">
          {teachers.map((teacher) => (
            <li key={teacher._id} className="p-4 border rounded-md shadow-sm bg-gray-50">
              <p className="text-lg font-bold">{teacher.name}</p>
              <p className="text-gray-600">{teacher.email}</p>
            </li>
          ))}
        </ul>
      )}
      <button 
        onClick={onBack} 
        className="mt-6 px-4 py-2 rounded-md shadow bg-gray-700 hover:bg-gray-600 text-white">
        Back
      </button>
    </div>
  );
};

export default TeachersList;
