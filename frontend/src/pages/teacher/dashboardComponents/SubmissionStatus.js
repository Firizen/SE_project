import React from "react";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

const SubmissionStatus = ({ assignment, onBack, socket }) => {
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(null);
  const [uploadedFileType, setUploadedFileType] = useState(null);

  // Fetch submission status
  const fetchSubmissionStatus = async () => {
    try {
      console.log("Fetching student details...");
      const studentsResponse = await fetch(
        `http://localhost:5000/api/students?className=${encodeURIComponent(assignment.className)}`
      );
      if (!studentsResponse.ok) throw new Error("Failed to fetch student details");
      const studentsData = await studentsResponse.json();

      console.log("Fetching submissions...");
      const submissionsResponse = await fetch(
        `http://localhost:5000/api/submissions?assignmentId=${assignment._id}`
      );
      if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions");
      const submissionsData = await submissionsResponse.json();

      const submittedStudentIds = new Set(submissionsData.map((s) => s.studentID));

      setTotalStudents(studentsData.length);
      setSubmittedStudents(studentsData.filter((s) => submittedStudentIds.has(s._id)));
      setNotSubmittedStudents(studentsData.filter((s) => !submittedStudentIds.has(s._id)));
    } catch (error) {
      console.error("Error fetching submission details:", error);
      alert("Error fetching submission details. Please check the console.");
    }
  };

  useEffect(() => {
    if (!assignment) return;

    fetchSubmissionStatus();

    // Listen for real-time updates
    socket.on("submissionUpdate", fetchSubmissionStatus);
    socket.on("submissionDeleted", fetchSubmissionStatus);

    return () => {
      socket.off("submissionUpdate", fetchSubmissionStatus);
      socket.off("submissionDeleted", fetchSubmissionStatus);
    };
  }, [assignment, socket]);

  // Fetch submitted document
  const fetchSubmittedDocument = async (studentID) => {
    try {
      console.log(`Fetching document for student: ${studentID}`);
      const res = await fetch(
        `http://localhost:5000/api/submissions/document?studentID=${studentID}&assignmentID=${assignment._id}`
      );
      if (!res.ok) throw new Error("No uploaded document found");

      const contentType = res.headers.get("Content-Type");
      setUploadedFileType(contentType);
      const blob = await res.blob();
      const fileURL = URL.createObjectURL(blob);
      setUploadedFileURL(fileURL);
      setViewingSubmission(studentID);
    } catch (error) {
      console.error("Error fetching submitted document:", error);
      alert("Failed to fetch document");
    }
  };

  const sendForResubmission = async (studentID) => {
    try {
      console.log(`Requesting resubmission for student: ${studentID}`);
  
      // Step 1: Delete the previous submission
      console.log("Calling DELETE endpoint to delete submission...");
      const deleteResponse = await fetch("http://localhost:5000/api/submissions/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentID, assignmentID: assignment._id }),
      });
  
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        console.error("Delete request failed:", errorData);
        throw new Error(errorData.error || "Failed to delete previous submission");
      }
      closeViewer();
      console.log("Submission deleted successfully");
  
  
      console.log("Resubmission requested successfully");
      
      closeViewer();
      // Refresh the submission status
      await fetchSubmissionStatus();
  
      // Notify other clients
      socket.emit("submissionDeleted");
  
      alert("Resubmission requested successfully");
    } catch (error) {
      console.error("Error requesting resubmission:", error);
      alert(error.message || "Failed to request resubmission");
    }
  };
  // Close the document preview
  const closeViewer = () => {
    if (uploadedFileURL) {
      URL.revokeObjectURL(uploadedFileURL); // Free memory
      setUploadedFileURL(null);
    }
    setViewingSubmission(null);
  };

  // Render the document preview
  if (viewingSubmission) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-8/12 h-[78vh] flex flex-col">
        <button className="mb-4 text-gray-600 text-2xl" onClick={closeViewer}>
          <FaArrowLeft />
        </button>
        <h2 className="text-xl font-semibold mb-4">View Submission</h2>

        <div className="flex-1">
          {uploadedFileURL ? (
            uploadedFileType === "application/pdf" ? (
              <iframe src={uploadedFileURL} className="w-full h-full border" title="PDF Preview"></iframe>
            ) : uploadedFileType?.startsWith("image/") ? (
              <img src={uploadedFileURL} alt="Submitted File" className="max-w-full h-auto" />
            ) : (
              <p className="text-gray-600">Preview not available for this file type.</p>
            )
          ) : (
            <p className="text-gray-600">No document available.</p>
          )}
        </div>

        <button
          className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg w-1/4"
          onClick={() => sendForResubmission(viewingSubmission)}
        >
          Request Resubmission
        </button>
      </div>
    );
  }

  // Render the main submission status view
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-8/12">
      <button className="mb-4 text-gray-600 text-2xl" onClick={onBack}>
        <FaArrowLeft />
      </button>

      <h2 className="text-xl font-semibold mb-4">Submission Status: {assignment.title}</h2>

      <div>
        <h3 className="text-lg font-semibold text-green-600">Submitted Students</h3>
        {submittedStudents.length > 0 ? (
          <ul className="space-y-3">
            {submittedStudents.map((student) => (
              <li key={student._id} className="p-4 border rounded-md shadow-sm bg-green-50 flex justify-between items-center">
                {student.name}
                <button
                  className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={() => fetchSubmittedDocument(student._id)}
                >
                  View Submission
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No students have submitted yet.</p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-red-600">Not Submitted Students</h3>
        {notSubmittedStudents.length > 0 ? (
          <ul className="space-y-3">
            {notSubmittedStudents.map((student) => (
              <li key={student._id} className="p-4 border rounded-md shadow-sm bg-red-50">
                {student.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">All students have submitted.</p>
        )}
      </div>
    </div>
  );
};

export default SubmissionStatus;