// src/components/dashboardComponents/ViewAllAssignments.js
import { useState, useEffect } from 'react';

function ViewAllAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllAssignments = async () => {
            setLoading(true);
            setError(null);
            try {

                const response = await fetch('http://localhost:5000/api/allassignments/all-with-teachers'); // Adjust URL if needed

                if (!response.ok) {
                    // Try to get error message from response body if possible
                    let errorMsg = `HTTP error! status: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error || errorData.message || errorMsg;
                    } catch (jsonError) {
                        // Response body wasn't valid JSON or empty
                        console.log("Could not parse error response as JSON.");
                    }
                    throw new Error(errorMsg);
                }

                const data = await response.json();
                setAssignments(data); // Set the fetched assignments

            } catch (err) {
                console.error("Error fetching all assignments:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllAssignments();
    }, []); // Empty dependency array means run once on mount

    if (loading) return <p className="text-center mt-4">Loading assignments...</p>;
    if (error) return <p className="text-center text-red-500 mt-4">Error: {error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">All Assignments</h2>
            {assignments.length === 0 ? (
                <p>No assignments found in the system.</p>
            ) : (
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border px-4 py-2 text-left">Title</th>
                            <th className="border px-4 py-2 text-left">Class</th>
                            <th className="border px-4 py-2 text-left">Created By</th>
                            <th className="border px-4 py-2 text-left">Created At</th>
                            <th className="border px-4 py-2 text-left">Due By</th>

                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map((assignment) => (
                            <tr key={assignment._id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{assignment.title}</td>
                                <td className="border px-4 py-2">{assignment.className || 'N/A'}</td>
                                <td className="border px-4 py-2">{assignment.teacherName}</td>
                                <td className="border px-4 py-2">
                                    {new Date(assignment.createdAt).toLocaleDateString()} {/* Format date */}
                                </td>
                                <td className="border px-4 py-2">
                                    {new Date(assignment.dueDate).toLocaleDateString()} {/* Format date */}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ViewAllAssignments;