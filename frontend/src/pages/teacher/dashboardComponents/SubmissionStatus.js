import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const SubmissionStatus = ({ assignment, onBack, socket }) => {
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]);
  const navigate = useNavigate();

  // Fetch submission status
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

      // Fetch plagiarism results for each submission
      const plagiarismResults = await Promise.all(
        submissionsData.map(async (submission) => {
          try {
            console.log(`Fetching plagiarism for submission ID : ${submission._id}`);
            const plagiarismRes = await axios.get(
              `http://localhost:5000/api/plagiarism/results?assignmentId=${assignment._id}&submissionID=${submission._id}`
            );

            console.log(`SUCCESS fetching for ${submission._id}. Status: ${plagiarismRes.status}`);
            console.log(`Response data for ${submission._id}:`, JSON.stringify(plagiarismRes.data, null, 2));

            console.log(`Accessing score for ${submission._id}: `, plagiarismRes.data?.ai_plagiarism_score);

            return {
              submissionID : submission._id,
              ai_plagiarism_score : plagiarismRes.data ?.ai_plagiarism_score ?? "Not Plagiarized",
            }
           

          } catch (error) {
            console.error(`Error fetching plagiarism results for submission ${submission._id}: `);
            console.warn(`No plagiarism result for submission ID: ${submission._id}`);

            if(error.response){
              console.error('Error status: ', error.response.status);
              console.error('Error data: ', JSON.stringify(error.response.data, null, 2));
              console.error('Error headers: ', error.response.headers);
            }

            else if (error.request) {
              // The request was made but no response was received
              console.error('Error Request:', error.request);
          } else {
              // Something happened in setting up the request that triggered an Error
              console.error('Error Message:', error.message);
          }
          console.error('Error Config:', error.config);
            return { submissionID: submission._id, aiPlagiarismScore: "N/A"  };
          }
        })
      );

      const submittedStudentsWithSubmissions = studentsData
        .map((student) => {
          const submission = submissionsData.find((sub) => sub.studentID === student._id) || null;
          const plagiarismData = plagiarismResults.find((p) => p.submissionID === submission?._id) || {};

          return {
            ...student,
            submission,
            aiPlagiarismScore: plagiarismData.ai_plagiarism_score ?? "N/A",
          };
        })
        .filter((student) => student.submission);

      const notSubmitted = studentsData.filter(
        (student) => !submissionsData.some((sub) => sub.studentID === student._id)
      );

      setSubmittedStudents(submittedStudentsWithSubmissions);
      setNotSubmittedStudents(notSubmitted);
    } catch (error) {
      console.error("Error fetching submission details:", error);
      alert("Error fetching submission details. Please check the console.");
    }
  };

  useEffect(() => {
    if (!assignment) return;
    fetchSubmissionStatus();
    socket.on("submissionUpdate", fetchSubmissionStatus);
    socket.on("submissionDeleted", fetchSubmissionStatus);

    return () => {
      socket.off("submissionUpdate", fetchSubmissionStatus);
      socket.off("submissionDeleted", fetchSubmissionStatus);
    };
  }, [assignment, socket]);

  const handleViewSubmission = (studentID) => {
    navigate(`/submission/${assignment._id}/${studentID}`);
  };

  const flagPlagiarism = async (submissionId, studentId) => {
    if (!submissionId) {
      alert("Error: Submission ID is missing. Cannot flag plagiarism.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/notifications/flag-plagiarism", {
        submissionId,
        studentId,
        assignmentTitle: assignment.title,
        assignmentID: assignment._id,
      });

      if (response.status === 200) {
        alert("Submission flagged for plagiarism, and the student has been notified.");
        fetchSubmissionStatus();
      } else {
        throw new Error("Failed to flag plagiarism");
      }
    } catch (error) {
      console.error("Error flagging plagiarism:", error);
      alert("Failed to flag plagiarism. Check console for details.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-8/12">
      <button className="mb-4 text-gray-600 text-2xl" onClick={onBack}>
        <FaArrowLeft />
      </button>

      <h2 className="text-xl font-semibold mb-4">Submission Status: {assignment.title}</h2>

      {/* ✅ Submitted Students */}
      <div>
        <h3 className="text-lg font-semibold text-green-600">Submitted Students</h3>
        {submittedStudents.length > 0 ? (
          <ul className="space-y-3">
            {submittedStudents.map((student) => {
              const { submission, aiPlagiarismScore} = student;
              const isFlagged = submission?.flagged;
              const submissionId = submission?._id;

              return (
                <li key={student._id} className={`p-4 border rounded-md shadow-sm flex justify-between items-center ${
                    isFlagged ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500"
                  }`}>
                  <div>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>AI Plagiarism Score:</strong> {aiPlagiarismScore}</p>
                    <button className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                      onClick={() => handleViewSubmission(student._id)}>
                      View Submission
                    </button>
                  </div>

                  {!isFlagged && submissionId && (
                    <button className="px-4 py-2 text-white rounded-lg bg-red-500 hover:bg-red-600"
                      onClick={() => flagPlagiarism(submissionId, student._id)}>
                      Flag Plagiarism
                    </button>
                  )}
                  {isFlagged && (
                    <span className="text-red-600 font-semibold">Plagiarism Flagged</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No students have submitted yet.</p>
        )}
      </div>

      {/* ❌ Not Submitted Students */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-red-600">Not Submitted Students</h3>
        {notSubmittedStudents.length > 0 ? (
          <ul className="space-y-3">
            {notSubmittedStudents.map((student) => (
              <li key={student._id} className="p-4 border rounded-md shadow-sm bg-gray-100 border-gray-500">
                <p><strong>Name:</strong> {student.name}</p>
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
