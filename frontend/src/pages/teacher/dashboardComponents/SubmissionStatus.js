import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

const SubmissionStatus = ({ assignment, onBack, socket }) => {
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(null);
  const [uploadedFileType, setUploadedFileType] = useState(null);

  useEffect(() => {
    if (!assignment) return;

    const fetchSubmissionStatus = async () => {
      try {
        const studentsResponse = await fetch(
          `http://localhost:5000/api/students?className=${encodeURIComponent(assignment.className)}`
        );
        if (!studentsResponse.ok) throw new Error("Failed to fetch student details");
        const studentsData = await studentsResponse.json();

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
      }
    };

    fetchSubmissionStatus();

    socket.on("submissionUpdate", fetchSubmissionStatus);
    socket.on("submissionDeleted", fetchSubmissionStatus);

    return () => {
      socket.off("submissionUpdate", fetchSubmissionStatus);
      socket.off("submissionDeleted", fetchSubmissionStatus);
    };
  }, [assignment, socket]);

  const fetchSubmittedDocument = async (studentID) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/submissions/getSubmittedDocument?studentID=${studentID}&assignmentID=${assignment._id}`
      );
      if (!res.ok) throw new Error("No uploaded document found");

      const contentType = res.headers.get("Content-Type");
      setUploadedFileType(contentType);
      const blob = await res.blob();
      setUploadedFileURL(URL.createObjectURL(blob));
      setViewingSubmission(studentID);
    } catch (error) {
      console.error("Error fetching submitted document:", error);
      alert("Failed to fetch document");
    }
  };

  if (viewingSubmission) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-8/12 h-[78vh] flex flex-col">
      <button className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg w-2/12" onClick={() => setViewingSubmission(null)}>
        ← Back
      </button>
      <h2 className="text-xl font-semibold mb-4">View Submission</h2>
      
      <div className="flex-1">
        {uploadedFileURL ? (
          uploadedFileType === "application/pdf" ? (
            <iframe 
              src={uploadedFileURL} 
              className="w-full h-full border" 
              title="PDF Preview"
            ></iframe>
          ) : uploadedFileType?.startsWith("image/") ? (
            <img src={uploadedFileURL} alt="Submitted File" className="max-w-full h-auto" />
          ) : (
            <p className="text-gray-600">Preview not available for this file type.</p>
          )
        ) : (
          <p className="text-gray-600">No document available.</p>
        )}
      </div>
    </div>
    
    );
  }

  const progress = totalStudents > 0 ? (submittedStudents.length / totalStudents) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-8/12">
      <button className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg" onClick={onBack}>
        ← Back
      </button>
      <h2 className="text-xl font-semibold mb-4">Submission Status: {assignment.title}</h2>

      <div className="mb-4">
        <p className="text-lg font-semibold mb-1">Progress: {submittedStudents.length}/{totalStudents}</p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

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

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-red-600">Not Submitted Students</h3>
        {notSubmittedStudents.length > 0 ? (
          <ul className="space-y-3">
            {notSubmittedStudents.map((student) => (
              <li key={student._id} className="p-4 border rounded-md shadow-sm bg-red-50">{student.name}</li>
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
