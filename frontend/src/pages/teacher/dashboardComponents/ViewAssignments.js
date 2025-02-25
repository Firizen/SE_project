import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to WebSocket server

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]);
  
  const teacherName = JSON.parse(localStorage.getItem("teacherDetails"))?.name;

  useEffect(() => {
    if (!teacherName) return;

    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/assignments?teacherName=${encodeURIComponent(teacherName)}`
        );
        if (!response.ok) throw new Error("Failed to fetch assignments");

        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [teacherName]);

  const fetchSubmissionStatus = async (assignmentId, className) => {
    try {
      if (!assignmentId || !className) return;

      // Fetch students in the class
      const studentsResponse = await fetch(
        `http://localhost:5000/api/students?className=${encodeURIComponent(className)}`
      );
      if (!studentsResponse.ok) throw new Error("Failed to fetch student details");
  
      const studentsData = await studentsResponse.json();
  
      // Fetch submissions for the assignment
      const submissionsResponse = await fetch(
        `http://localhost:5000/api/submissions?assignmentId=${assignmentId}`
      );
      if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions");
  
      const submissionsData = await submissionsResponse.json();
  
      // Extract student IDs who submitted
      const submittedStudentIds = new Set(submissionsData.map((submission) => submission.studentID));
  
      // Separate students based on submission status
      const submitted = studentsData.filter((student) => submittedStudentIds.has(student._id));
      const notSubmitted = studentsData.filter((student) => !submittedStudentIds.has(student._id));
  
      setSubmittedStudents(submitted);
      setNotSubmittedStudents(notSubmitted);
    } catch (error) {
      console.error("Error fetching student submission details:", error);
    }
  };

  useEffect(() => {
    if (!selectedAssignment) return;
  
    // Fetch assignment details to get className
    const assignment = assignments.find((a) => a._id === selectedAssignment);
    if (!assignment) return;
  
    fetchSubmissionStatus(selectedAssignment, assignment.className);
  
    // Listen for real-time submission updates
    const handleSubmissionUpdate = (newSubmission) => {
      if (!newSubmission || !newSubmission.fullDocument) {
        console.warn("Received undefined or invalid submission update:", newSubmission);
        return;
      }

      if (newSubmission.fullDocument.assignmentID === selectedAssignment) {
        fetchSubmissionStatus(selectedAssignment, assignment.className);
      }
    };

    // Listen for real-time submission deletions
    const handleSubmissionDeleted = (deletedSubmission) => {
      if (!deletedSubmission || !deletedSubmission.assignmentID) {
        console.warn("Received undefined or invalid submission delete event:", deletedSubmission);
        return;
      }

      if (deletedSubmission.assignmentID === selectedAssignment) {
        fetchSubmissionStatus(selectedAssignment, assignment.className);
      }
    };

    socket.on("submissionUpdate", handleSubmissionUpdate);
    socket.on("submissionDeleted", handleSubmissionDeleted);
  
    return () => {
      socket.off("submissionUpdate", handleSubmissionUpdate);
      socket.off("submissionDeleted", handleSubmissionDeleted);
    };
  }, [selectedAssignment, assignments]);
  
  return (
    <div className="flex space-x-6">
      {/* Assignment List */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-5/12 h-5/6">
        <h2 className="text-xl font-semibold mb-4">My Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments available.</p>
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => (
              <li key={assignment._id} className="p-4 border rounded-md shadow-sm bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-black-600">Title: {assignment.title}</h3>
                  <p className="text-gray-600"><strong>Description:</strong> {assignment.description || "No description provided"}</p>
                  <p className="text-gray-600"><strong>Class:</strong> {assignment.className}</p>
                  <p className="text-gray-600"><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}</p>
                </div>
                <button
                  className={`px-4 py-2 rounded-md shadow ${
                    selectedAssignment === assignment._id ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  onClick={() => {
                    if (selectedAssignment === assignment._id) {
                      setSelectedAssignment(null);
                      setSubmittedStudents([]);
                      setNotSubmittedStudents([]);
                    } else {
                      setSelectedAssignment(assignment._id);
                    }
                  }}
                >
                  {selectedAssignment === assignment._id ? "Hide Status" : "View Status"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Student Submission Details */}
      {selectedAssignment && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-6/12 h-5/6">
          <h2 className="text-xl font-semibold mb-4">Submission Status</h2>

          {/* Submitted Students */}
          <div>
            <h3 className="text-lg font-semibold text-green-600">Submitted Students</h3>
            {submittedStudents.length > 0 ? (
              <ul className="space-y-3">
                {submittedStudents.map((student) => (
                  <li key={student._id} className="p-4 border rounded-md shadow-sm bg-green-50">{student.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No students have submitted yet.</p>
            )}
          </div>

          {/* Not Submitted Students */}
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
      )}
    </div>
  );
};

export default ViewAssignments;
