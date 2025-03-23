import { useState } from "react";
import React from "react";

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
    <div className="flex items-center justify-center w-full bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-7/12 h-5/6 ">
        <h2 className="text-xl font-semibold mb-4 text-center">Create Assignment</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
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

          {/* Dropdown for Class Selection */}
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Select Class</option>
            <option value="A">Class A</option>
            <option value="B">Class B</option>
            <option value="C">Class C</option>
            <option value="D">Class D</option>
          </select>

          <div className="mt-4 text-base font-semibold">Enter Due Date:</div>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="w-5/12 mt-14 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAssignment;
