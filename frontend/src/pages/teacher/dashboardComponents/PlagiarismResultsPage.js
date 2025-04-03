import { useState, useEffect } from "react";
// useParams is no longer strictly needed for the fetch logic, but might remain
// depending on your routing setup. useNavigate is still used for the back button.
import { useParams, useNavigate } from "react-router-dom";

// Console log remains for debugging mount
console.log("🟢 PlagiarismResultsPage component mounted! (Fetching ALL results mode)");

function PlagiarismResultsPage() {
  // We still might get an assignmentId from the URL depending on the route,
  // but we won't use it for fetching ALL results.
  const { assignmentId } = useParams();
  console.log("📌 assignmentId from useParams (INFO ONLY):", assignmentId); // Log for info

  const [plagiarismResults, setPlagiarismResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // This effect now runs only once on mount because of the empty dependency array []
    console.log("🎯 useEffect triggered (Fetching ALL results)");

    const fetchAllPlagiarismResults = async () => {
      try {
        console.log("🚀 Fetching ALL plagiarism results...");

        // MODIFICATION: Changed the API endpoint to fetch ALL results.
        // Assumes your backend has an endpoint like GET /api/plagiarism-results
        // that returns an array of all plagiarism result documents.
        const res = await fetch(`http://localhost:5000/api/aiplagiarism-results`);

        if (!res.ok) {
          console.error("❌ Error fetching all plagiarism results, status:", res.status);
          // Consider setting an error state here to show feedback to the user
          setPlagiarismResults([]); // Clear any previous results
          return; // Exit the function
        }

        const plagiarismData = await res.json();
        console.log("📜 ALL Plagiarism Results received:", plagiarismData);

        // IMPORTANT: Ensure your backend includes 'assignmentID' in each result object
        // if you want to display which assignment a result belongs to.
        setPlagiarismResults(plagiarismData);

      } catch (error) {
        console.error("❌ Error fetching all plagiarism results:", error);
        // Consider setting an error state here
        setPlagiarismResults([]); // Clear results on error
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlagiarismResults();

    // MODIFICATION: Changed dependency array to [] to run only on mount.
  }, []); // Empty dependency array

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="bg-gray-600 text-white px-4 py-2 rounded mb-4">
        ← Back
      </button>
      {/* MODIFICATION: Changed title slightly for clarity */}
      <h2 className="text-2xl font-bold mb-4">All Plagiarism Results</h2>

      {loading ? (
        <p>Loading...</p>
      ) : plagiarismResults.length === 0 ? (
        // MODIFICATION: Updated empty state message
        <p>No plagiarism results found in the system.</p>
      ) : (
        <table className="min-w-full border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-200">
              {/* ADDED: Column for Assignment ID */}
              <th className="border px-4 py-2">Assignment ID</th>
              <th className="border px-4 py-2">Filename</th>
              <th className="border px-4 py-2">Plagiarism Score</th>
              <th className="border px-4 py-2">Label</th>
              <th className="border px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {plagiarismResults.map((result, index) => (
              // Using result._id is generally better if available, otherwise index is okay
              <tr key={result._id || index} className="text-center">
                 {/* ADDED: Displaying the Assignment ID */}
                 {/* Make sure 'assignmentID' exists in your result objects from the API */}
                <td className="border px-4 py-2 text-xs">{result.assignmentID || 'N/A'}</td>
                <td className="border px-4 py-2">{result.filename}</td>
                <td className="border px-4 py-2">
                {/* Check if the score is not null/undefined AND is a number */}
                  {result.ai_plagiarism_score != null && typeof result.ai_plagiarism_score === 'number'
                ? `${result.ai_plagiarism_score}%` // If true, display number with %
                    : result.ai_plagiarism_score      // If false, display the original value
                   }</td>
                <td className={`border px-4 py-2 ${
                    result.label === "0" ? "text-red-500" :
                    result.label === "1" ? "text-green-500" :
                    "text-gray-500" // Optional: Default color for unexpected values
                  }`}>
                {
                  result.label === "0" ? "AI-Generated" :
                  result.label === "1" ? "Human-Generated" :
                  "Unknown Status" // Optional: Default text for unexpected values
                  }
                </td>
                <td className="border px-4 py-2">{result.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PlagiarismResultsPage;