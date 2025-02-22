import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";

const SubmitAssignment = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    await fetch(`http://localhost:5000/api/assignments/${id}/submit`, {
      method: "POST",
      headers: { Authorization: localStorage.getItem("token") },
      body: formData,
    });

    alert("Assignment submitted!");
  };

  return (
    <div>
      <Navbar />
      <h2>Submit Assignment</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmitAssignment;
