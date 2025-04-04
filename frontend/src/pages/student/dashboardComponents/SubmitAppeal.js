import React, { useState } from "react";
import axios from "axios";

const SubmitAppeal = () => {
  const [formData, setFormData] = useState({
    assignmentTitle: "", 
    explanation: "", // ✅ Updated field name
    evidence: "", // ✅ Updated field name
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    console.log("🔹 Token Being Sent:", token);

    if (!token) {
      setMessage("Error: User not authenticated. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log("🔹 Request Headers:", headers);

      const requestData = {
        assignmentTitle: formData.assignmentTitle,
        explanation: formData.explanation, 
        evidence: formData.evidence,
      };

      console.log("🔹 Request Data:", requestData); // ✅ Logs request data before sending

      const response = await axios.post(
        "http://localhost:5000/api/appeals",
        requestData,
        { headers }
      );

      setMessage("✅ Appeal submitted successfully!");
      setFormData({ assignmentTitle: "", explanation: "", evidence: "" });
    } catch (error) {
      console.error("🔹 API Error:", error.response?.data || error.message);
      setMessage(
        error.response?.data?.message || "❌ Error submitting appeal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Submit Appeal</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-semibold mb-2">
            Assignment Title:
          </label>
          <input
            type="text"
            name="assignmentTitle"
            value={formData.assignmentTitle}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-semibold mb-2">
            Explanation:
          </label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-semibold mb-2">
            Evidence (Optional):
          </label>
          <textarea
            name="evidence"
            value={formData.evidence}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className={`px-4 py-2 rounded transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Appeal"}
        </button>

        {message && (
          <p className={`mt-2 ${message.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default SubmitAppeal;
