import { useState } from "react";

const CreateAssignment = ({ fetchAssignments }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState(null);

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
      fetchAssignments(); // Refresh assignments list
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError("Error creating assignment");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Create Assignment</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleCreateAssignment} className="space-y-4">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
        <input type="text" placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">Create</button>
      </form>
    </div>
  );
};

export default CreateAssignment;
