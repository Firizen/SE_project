import { useState } from "react";

function CreateAssignment() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState(null);
  const teacherName = JSON.parse(localStorage.getItem("teacherDetails"))?.name || "Unknown";

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!title || !className || !dueDate) {
      setError("Title, Class Name, and Due Date are required.");
      return;
    }
    
    const newAssignment = { title, description, className, teacherName, dueDate };

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
      setDueDate("");
      setError(null);
      alert("Assignment Created Successfully!");
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError("Error creating assignment");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-6/12 h-5/6">
      <h2 className="text-xl font-semibold mb-4 text-center">Create Assignment</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleCreateAssignment} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        
        Enter Due Date:
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <center>
        <button
          type="submit"
          className="w-5/12 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
        >
          Create
        </button>
        </center>
      </form>
    </div>
  );
}

export default CreateAssignment;
