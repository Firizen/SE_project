import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa"; // Import arrow icon

function AssignmentDetails({ assignment, resetSelection }) {
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    const studentID = localStorage.getItem("studentID");
    if (!studentID) {
      alert("Student not logged in!");
      return;
    }

    // Check if assignment is already submitted
    fetch(`http://localhost:5000/api/submissions/checkStudentSubmission?studentID=${studentID}&assignmentID=${assignment._id}`)
      .then((res) => res.json())
      .then((data) => setSubmitted(data.submitted))
      .catch((err) => console.error("Error checking submission:", err));
  }, [assignment._id]);

  const handleSubmit = async () => {
    const studentID = localStorage.getItem("studentID");
    if (!studentID) {
      alert("Student not logged in!");
      return;
    }

    const submissionData = { studentID, assignmentID: assignment._id };

    try {
      const response = await fetch("http://localhost:5000/api/submissions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit assignment");
      }

      alert("Assignment submitted successfully!");
      setSubmitted(true); // Update UI after successful submission
    } catch (err) {
      console.error("Error submitting assignment:", err);
      alert("Submission failed!");
    }
  };

  return (
    <div className="p-8 w-full h-screen bg-white">
      {/* Back Arrow Button */}
      <button onClick={resetSelection} className="text-gray-600 text-2xl mb-4">
        <FaArrowLeft />
      </button>

      <h3 className="text-2xl font-semibold mb-4">{assignment.title}</h3>
      <p className="text-gray-600">
        <strong>Created by:</strong> {assignment.teacherName || "Unknown"}
      </p>
      <p className="text-gray-600">
        <strong>Description:</strong> {assignment.description}
      </p>
      <p className="text-gray-600">
        <strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}
      </p>
      <p className="text-gray-600">
        <strong>ID:</strong> {assignment._id}
      </p>

      {/* Submit Button */}
      {submitted ? (
        <button className="bg-gray-400 mt-6 text-white px-4 py-2 rounded-md shadow cursor-not-allowed" disabled>
          Assignment Submitted
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          className="bg-blue-500 mt-6 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
        >
          Submit
        </button>
      )}
    </div>
  );
}

export default AssignmentDetails;
