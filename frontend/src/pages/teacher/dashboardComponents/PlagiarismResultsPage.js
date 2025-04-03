// PlagiarismResultsPage.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

console.log("🟢 PlagiarismResultsPage component mounted! (Fetching results for SPECIFIC assignment)");

function PlagiarismResultsPage() {
  const { assignmentId } = useParams();
  console.log("📌 assignmentId from useParams:", assignmentId);

  const [plagiarismResults, setPlagiarismResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ... (fetch logic remains the same as the previous version) ...
    if (!assignmentId) {
      console.log("⚠️ No assignmentId found in URL params.");
      setLoading(false);
      setPlagiarismResults([]);
      setFetchError("No Assignment ID provided.");
      return;
    }

    console.log(`🎯 useEffect triggered (Fetching results for assignment: ${assignmentId})`);

    const fetchPlagiarismResultsForAssignment = async () => {
      setLoading(true);
      setFetchError(null); // Reset error
      setPlagiarismResults([]); // Clear previous results

      try {
        console.log(`🚀 Fetching plagiarism results for assignment ${assignmentId}...`);
        const res = await fetch(`http://localhost:5000/api/aiplagiarism-results/${assignmentId}`);

        if (!res.ok) {
          let errorMsg = `Error fetching plagiarism results (Status: ${res.status})`;
          if (res.status === 404) {
            console.log(`ℹ️ No results found for assignment ${assignmentId}.`);
            errorMsg = "No plagiarism results found for this assignment.";
          } else {
            console.error(`❌ Error fetching plagiarism results for ${assignmentId}, status:`, res.status);
          }
          setFetchError(errorMsg);
          setPlagiarismResults([]);
          return;
        }

        const plagiarismData = await res.json();
        console.log(`📜 Plagiarism Results received for ${assignmentId}:`, plagiarismData);
        setPlagiarismResults(plagiarismData);

      } catch (error) {
        console.error(`❌ Error fetching plagiarism results for ${assignmentId}:`, error);
        setFetchError("An unexpected error occurred while fetching results.");
        setPlagiarismResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlagiarismResultsForAssignment();

  }, [assignmentId]);

  // --- Calculation for Average Score ---
  const calculateAverageScore = () => {
    if (loading || fetchError || plagiarismResults.length === 0) return null;

    let sum = 0;
    let count = 0;
    plagiarismResults.forEach(result => {
      if (result.ai_plagiarism_score != null && typeof result.ai_plagiarism_score === 'number' && !isNaN(result.ai_plagiarism_score)) {
        sum += result.ai_plagiarism_score;
        count++;
      }
    });

    if (count === 0) return null; // Return null if no valid scores, handle "N/A" in render

    const average = sum / count;
    return average.toFixed(2); // Return the number string, add % in render
  };

  // --- Calculation for Plagiarized Count ---
  const calculatePlagiarizedCount = () => {
    // No need to check loading/error here if only called when plagiarismResults has data
    if (plagiarismResults.length === 0) return 0;

    let plagiarizedCount = 0;
    plagiarismResults.forEach(result => {
      // Assuming "0" means AI-Generated/Plagiarized
      if (result.label === "0") {
        plagiarizedCount++;
      }
    });
    return plagiarizedCount;
  };

  // Calculate values on each render
  const averageScoreValue = calculateAverageScore();
  const plagiarizedCount = calculatePlagiarizedCount();


  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="bg-gray-600 text-white px-4 py-2 rounded mb-4">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-2">
        Plagiarism Results for Assignment
      </h2>

      {/* --- MODIFIED: Display Average Score AND Plagiarized Count --- */}
      {/* Show this section only if loading is done, no errors, and there are results */}
      {!loading && !fetchError && plagiarismResults.length > 0 && (
         <div className="text-lg font-semibold mb-4 flex items-center space-x-4"> {/* Use flexbox for layout */}
            {/* Average Score Part */}
            <span className={averageScoreValue !== null ? 'text-red-600' : 'text-gray-500'}> {/* Conditional red color */}
                Average Score: {averageScoreValue !== null ? `${averageScoreValue}%` : 'N/A'}
            </span>

            {/* Separator */}
            <span>|</span>

            {/* Plagiarized Count Part */}
            <span> {/* No specific color needed unless desired */}
                AI-Generated: {plagiarizedCount} submission(s)
            </span>
         </div>
      )}
      {/* Handle case where there are no results (even if fetch was successful) */}
      {!loading && !fetchError && plagiarismResults.length === 0 && (
          <p className="text-gray-600 mb-4">No submissions found for this assignment to analyze.</p>
      )}


      {/* Display fetch errors if any */}
      {fetchError && !loading && <p className="text-red-500 mb-4">Error: {fetchError}</p>}

      {/* Display Loading or Table */}
      {loading ? (
        <p>Loading results...</p>
      ) : !fetchError && plagiarismResults.length > 0 ? ( // Show table only if no error and results exist
        <table className="min-w-full border border-gray-300 bg-white">
          {/* Table Head */}
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Filename</th>
              <th className="border px-4 py-2">Plagiarism Score</th>
              <th className="border px-4 py-2">Label</th>
              <th className="border px-4 py-2">Message</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {plagiarismResults.map((result, index) => (
              <tr key={result._id || index} className="text-center">
                <td className="border px-4 py-2">{result.filename}</td>
                <td className="border px-4 py-2">
                  {result.ai_plagiarism_score != null && typeof result.ai_plagiarism_score === 'number'
                    ? `${result.ai_plagiarism_score}%`
                    : result.ai_plagiarism_score}
                </td>
                <td className={`border px-4 py-2 ${
                    result.label === "0" ? "text-red-500" :
                    result.label === "1" ? "text-green-500" :
                    "text-gray-500"
                  }`}>
                  {
                    result.label === "0" ? "AI-Generated" :
                    result.label === "1" ? "Human-Generated" :
                    "Unknown Status"
                  }
                </td>
                <td className="border px-4 py-2">{result.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null /* Error case already handled above */ }
    </div>
  );
}

export default PlagiarismResultsPage;