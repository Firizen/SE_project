import React, { useState } from "react";
import axios from "axios";

const RegularPlagiarismCheck = () => {
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [similarityResults, setSimilarityResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const fetchSimilarityResults = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/plagiarism-results");
      if (response.data.results && response.data.results.length > 0) {
        setSimilarityResults(response.data.results);
      }
    } catch (error) {
      console.error("❌ Error fetching similarity results:", error);
    }
  };

  const handleRegularPlagiarismCheck = () => {
    setShowAssignmentDetails(true);
    setShowResults(true);  // Show results section when button is clicked
    fetchSimilarityResults();  // Fetch existing results
  };

  const handleRunPlagiarismCheck = async () => {
    setLoading(true);
    try {
      console.log("🔍 Running plagiarism check...");
      await axios.post("http://localhost:5000/api/similarity", { threshold: 0.3 });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const response = await axios.get("http://localhost:5000/api/plagiarism-results");
      if (response.data.results && response.data.results.length > 0) {
        setSimilarityResults(response.data.results);
        console.log("✅ Results updated!");
      }
    } catch (error) {
      console.error("❌ Error running plagiarism check:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={handleRegularPlagiarismCheck} 
          className="w-60 py-4 rounded bg-green-500 text-white hover:bg-blue-600"
        >
          Regular Plagiarism Check
        </button>
      </div>

      {showAssignmentDetails && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg mb-4">
          <h2 className="text-xl font-semibold">Assignment Details</h2>
          <p><strong>TITLE:</strong> AI-TEST,Essay Writing</p>
          <p><strong>DESCRIPTION:</strong> Sample Assignment</p>
          <p><strong>CLASS NAME:</strong> C</p>
          <p><strong>TEACHER NAME:</strong> Neeraj Nair</p>
          <div className="flex space-x-4 mt-4">
            <button 
              onClick={handleRunPlagiarismCheck} 
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Running..." : "Run Plagiarism Check"}
            </button>
            <button 
              onClick={() => setShowAssignmentDetails(false)} 
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="mt-5">
          <h3 className="text-xl font-semibold mb-2">Stored Similarity Results</h3>
          {similarityResults.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Student 1</th>
                  <th className="border px-4 py-2">Student 2</th>
                  <th className="border px-4 py-2">Similarity (%)</th>
                  <th className="border px-4 py-2 w-[500px]">Highlighted Text</th>
                </tr>
              </thead>
              <tbody>
                {similarityResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{result["Student 1"]}</td>
                    <td className="border px-4 py-2">{result["Student 2"]}</td>
                    <td className="border px-4 py-2 font-bold">{result["Similarity"]}%</td>
                    <td className="border px-4 py-2 w-[500px] text-red-600 italic">
                      {result["Highlighted Text"] || "No highlighted text available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">
              {loading ? "Checking for similarities..." : "No results found"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RegularPlagiarismCheck;
