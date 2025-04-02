import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PlagiarismResultsPage() {
  const { assignmentId } = useParams();
  const [plagiarismResults, setPlagiarismResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlagiarismResults = async () => {
      try {
        console.log("🚀 Fetching submissions for assignment:", assignmentId);
        const submissionRes = await fetch(`http://localhost:5000/api/submissions?assignmentID=${assignmentId}`);
        const submissionData = await submissionRes.json();

        console.log("📜 Submissions received:", submissionData);
        const submissionIds = submissionData.map(sub => sub._id);

        

        const plagiarismPromises = submissionIds.map(async(submissionId) => {
            const res = await fetch(`http://localhost:5000/api/plagiarism-results/${submissionId}`);
            return res.json();
        });

        const plagiarismData = await Promise.all(plagiarismPromises);
        console.log("📜 Plagiarism Results received:", plagiarismData);
        setPlagiarismResults(plagiarismData);
      } catch (error) {
        console.error("Error fetching plagiarism results:", error);
      } finally {
      setLoading(false);
      }
    };

    fetchPlagiarismResults();
  }, [assignmentId]);

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="bg-gray-600 text-white px-4 py-2 rounded mb-4">
        ← Back to Assignments
      </button>
      <h2 className="text-2xl font-bold mb-4">Plagiarism Results</h2>

      {loading ? (
        <p>Loading...</p>
      ) : plagiarismResults.length === 0 ? (
        <p>No plagiarism results found for this assignment.</p>
      ) : (
        <table className="min-w-full border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Filename</th>
              <th className="border px-4 py-2">Plagiarism Score</th>
              <th className="border px-4 py-2">Label</th>
              <th className="border px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {plagiarismResults.map((result, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">{result.filename}</td>
                <td className="border px-4 py-2">{result.ai_plagiarism_score}%</td>
                <td className={`border px-4 py-2 ${result.label === 0 ? "text-red-500" : "text-green-500"}`}>
                  {result.label === 0 ? "Plagiarized" : "Human-Generated"}
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
