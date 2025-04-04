
import { useState } from "react";

export default function AIContentCheck() {
    const [message, setMessage] = useState("");
    const [results, setResults] = useState([]);

    const downloadFiles = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/ai-check/downloadFiles", {
                method: "GET",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Download response:", data);
        } catch (error) {
            console.error("Error downloading files:", error);
        }
    };

    const handleRunAI = async () => {
        setMessage("Running AI detection...");
        try {
            const response = await fetch("http://localhost:5000/api/ai-check/runAI", {  // ✅ Correct endpoint
                method: "POST",
            })
            const data = await response.json();
            setMessage(data.message);
            setResults(data.results || []);
        } catch (error) {
            console.error("Error running AI:", error);
            setMessage("AI processing failed.");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">AI Content Check</h2>
            <button onClick={downloadFiles} className="bg-blue-500 text-white px-4 py-2 rounded mr-4">
                Download Files
            </button>
            <button onClick={handleRunAI} className="bg-green-500 text-white px-4 py-2 rounded">
                Run AI
            </button>
            <p className="mt-4 text-lg">{message}</p>
            <div className="mt-6">
                <h3 className="text-xl font-semibold">Results:</h3>
                <table className="w-full mt-2 border border-collapse border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-4 py-2">Filename</th>
                            <th className="border px-4 py-2">Perplexity</th>
                            <th className="border px-4 py-2">Burstiness</th>
                            <th className="border px-4 py-2">AI Score</th>
                            <th className="border px-4 py-2">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length > 0 ? (
                            results.map((result, index) => (
                                <tr key={index} className="border">
                                    <td className="border px-4 py-2">{result.filename}</td>
                                    <td className="border px-4 py-2">{result.perplexity}</td>
                                    <td className="border px-4 py-2">{result.burstiness}</td>
                                    <td className="border px-4 py-2">{result.ai_plagiarism_score}</td>
                                    <td className="border px-4 py-2">{result.message}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-4 text-gray-500">No results available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
