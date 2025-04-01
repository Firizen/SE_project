import { useState } from "react";
import StudentsList from "./StudentsList"; // Import the StudentsList component
import TeachersList from "./TeachersList"; // Import the TeachersList component

const ManageUsers = () => {
  const [view, setView] = useState(null);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-10/12">
      {/* Conditionally Render Based on View */}
      {view === "students" ? (
        <StudentsList onBack={() => setView(null)} />
      ) : view === "teachers" ? (
        <TeachersList onBack={() => setView(null)} />
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <div className="flex space-x-4">
            <button
              className="w-60 py-4 rounded bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setView("students")}
            >
              View Students
            </button>
            <button
              className="w-60 py-4 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={() => setView("teachers")}
            >
              View Teachers
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;
