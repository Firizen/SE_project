import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

function AssignmentDetails({ assignment, resetSelection }) {
  const [submitted, setSubmitted] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(null);
  const [uploadedFileType, setUploadedFileType] = useState(null);

  useEffect(() => {
    const studentID = localStorage.getItem("studentID");
    if (!studentID) {
      alert("Student not logged in!");
      return;
    }

    fetch(`http://localhost:5000/api/submissions/checkStudentSubmission?studentID=${studentID}&assignmentID=${assignment._id}`)
      .then((res) => res.json())
      .then((data) => {
        setSubmitted(data.submitted);
        if (data.submitted) {
          fetchSubmittedDocument(studentID, assignment._id);
        }
      })
      .catch((err) => console.error("Error checking submission:", err));
  }, [assignment._id]);

  // Fetch the submitted document as a blob and detect its type
  const fetchSubmittedDocument = (studentID, assignmentID) => {
    fetch(`http://localhost:5000/api/submissions/getSubmittedDocument?studentID=${studentID}&assignmentID=${assignmentID}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("No uploaded document found");
        }
        const contentType = res.headers.get("Content-Type"); // Get the MIME type
        setUploadedFileType(contentType); // Store the file type
        return res.blob();
      })
      .then((blob) => {
        const fileURL = URL.createObjectURL(blob);
        setUploadedFileURL(fileURL);
      })
      .catch((err) => console.error("Error fetching submitted document:", err));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const fileURL = URL.createObjectURL(file);
      setFilePreview(fileURL);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file before submitting.");
      return;
    }

    const studentID = localStorage.getItem("studentID");
    if (!studentID) {
      alert("Student not logged in!");
      return;
    }

    const formData = new FormData();
    formData.append("studentID", studentID);
    formData.append("assignmentID", assignment._id);
    formData.append("document", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/api/submissions/submit", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to submit assignment");
      }

      alert("Assignment submitted successfully!");
      setSubmitted(true);
      fetchSubmittedDocument(studentID, assignment._id);
    } catch (err) {
      console.error("Error submitting assignment:", err);
      alert("Submission failed!");
    }
  };

  return (
    <div className="p-8 w-full h-screen bg-white flex">
      {/* Left Section */}
      <div className="w-2/3">
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

        {/* File Upload Section - Hide if submitted */}
        {!submitted && (
          <div className="mt-4">
            <label className="block text-gray-700">Upload Document:</label>
            <input type="file" onChange={handleFileChange} className="border p-2 w-full" />
          </div>
        )}

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

      {/* Right Section - File Preview */}
      <div className="w-1/3 ml-8 border-l pl-4">
        {submitted ? (
          uploadedFileURL ? (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Uploaded Document:</h4>
              {uploadedFileType === "application/pdf" ? (
                <iframe src={uploadedFileURL} className="w-full h-64 border" title="PDF Preview"></iframe>
              ) : uploadedFileType?.startsWith("image/") ? (
                <img src={uploadedFileURL} alt="Submitted File" className="max-w-full h-auto" />
              ) : (
                <p className="text-gray-600">Preview not available for this file type.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600 mt-4">No uploaded document found.</p>
          )
        ) : (
          filePreview && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">File Preview:</h4>
              {selectedFile.type.startsWith("image/") ? (
                <img src={filePreview} alt="Preview" className="max-w-full h-auto" />
              ) : selectedFile.type === "application/pdf" ? (
                <iframe src={filePreview} className="w-full h-64 border" title="PDF Preview"></iframe>
              ) : (
                <p className="text-gray-600">Preview not available for this file type.</p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AssignmentDetails;
