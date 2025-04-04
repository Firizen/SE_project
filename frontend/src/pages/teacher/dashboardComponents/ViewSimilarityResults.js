import { useState, useEffect } from "react";
import axios from "axios";

function ViewSimilarityResults() {
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const teacher = JSON.parse(localStorage.getItem("teacherDetails")) || { name: "Unknown" };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/assignments?teacherName=${teacher.name}`
        );
        setAssignments(response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };
    fetchAssignments();
  }, [teacher.name]);

  const fetchPlagiarismResults = async (assignmentId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/plagiarism-results?assignmentId=${assignmentId}`
      );
      setResults(response.data.results);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  // === Stats Filtering Logic for > 90% ===
  const highSimilarityResults = results.filter((r) => r.Similarity > 90);
  const uniqueHighSimilarityStudents = new Set();

  highSimilarityResults.forEach((r) => {
    uniqueHighSimilarityStudents.add(r["Student 1"]);
    uniqueHighSimilarityStudents.add(r["Student 2"]);
  });

  const numUniqueAbove90 = uniqueHighSimilarityStudents.size;
  const avgSimilarityAll =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.Similarity, 0) / results.length).toFixed(2)
      : "0.00";
  const avgSimilarityAbove90 =
    highSimilarityResults.length > 0
      ? (
          highSimilarityResults.reduce((sum, r) => sum + r.Similarity, 0) /
          highSimilarityResults.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="p-6">
      {!showResults ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Your Assignments</h2>
          {assignments.length === 0 ? (
            <p>No assignments found.</p>
          ) : (
            <ul className="space-y-4">
              {assignments.map((assignment) => (
                <li
                  key={assignment._id}
                  className="p-4 bg-gray-200 rounded-lg flex justify-between items-center"
                >
                  <span className="text-lg font-semibold">{assignment.title}</span>
                  <button
                    onClick={() => {
                      if (
                        assignment.title === "AI - Test" ||
                        assignment.title === "Essay Writing "
                      ) {
                        fetchPlagiarismResults(assignment._id);
                      } else {
                        alert("Results only available for AI-TEST and Essay Writing");
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
                  >
                    View Results
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="mt-8">
          <button
            onClick={() => setShowResults(false)}
            className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Back to Assignments
          </button>

          <h3 className="text-2xl font-bold mb-4">Plagiarism Results for AI-TEST</h3>

          {loading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto">
              {/* === Stats for Similarity === */}
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-lg font-bold">Students with &gt; 90% similarity: {numUniqueAbove90}</p>
                <p className="text-lg font-bold">Average similarity (all): {avgSimilarityAll}%</p>
                <p className="text-lg font-bold">Average similarity (&gt; 90%): {avgSimilarityAbove90}%</p>
              </div>

              {/* === Full Table Display === */}
              <table className="min-w-full bg-white border border-gray-300 shadow-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-4 py-2">Student 1</th>
                    <th className="border px-4 py-2">Student 2</th>
                    <th className="border px-4 py-2">Similarity</th>
                    <th className="border px-4 py-2">Highlighted Content</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{result["Student 1"]}</td>
                      <td className="border px-4 py-2">{result["Student 2"]}</td>
                      <td
                        className={`border px-4 py-2 font-semibold ${
                          result.Similarity > 90 ? "text-red-600" : "text-gray-800"
                        }`}
                      >
                        {result.Similarity}%
                      </td>
                      <td className="border px-4 py-2 max-w-[500px] text-gray-700">
                        {result["Highlighted Text"]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No plagiarism results found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewSimilarityResults;
