import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ViewSubmission = () => {
  const params = useParams();
  const navigate = useNavigate();

  // Extract studentID & assignmentID safely
  const studentID = params.studentID || "";
  const assignmentID = params.assignmentID || "";

  const [documentURL, setDocumentURL] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Extracted Params:", params); // Debugging
    if (studentID && assignmentID) {
      fetchSubmission();
    } else {
      setError("Invalid student or assignment ID.");
      navigate("/"); // Redirect to home or error page if invalid
    }
  }, [studentID, assignmentID, navigate]);

  const fetchSubmission = async () => {
    if (!studentID || !assignmentID) {
      setError("Missing student or assignment ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/submissions/document`, {
        params: { studentID, assignmentID },
        responseType: "blob",
      });

      console.log("API Response Headers:", response.headers);

      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const url = URL.createObjectURL(blob);
      setDocumentURL(url);
      setError(null);
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError("Failed to load the document. Please check if it was submitted.");
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>View Submission</h2>

      {loading && <p>Loading document...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {documentURL ? (
        <iframe
          src={documentURL}
          title="Submitted Document"
          width="80%"
          height="500px"
          style={{ border: "1px solid black", marginTop: "20px" }}
        />
      ) : (
        !loading && <p>No submission found.</p>
      )}

      <button onClick={fetchSubmission} style={{ marginTop: "20px", padding: "10px" }}>
        Refresh Submission
      </button>
    </div>
  );
};

export default ViewSubmission;
