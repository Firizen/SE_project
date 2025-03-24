import React, { useState } from "react";
import axios from "axios";

const SubmitAppeal = () => {
  const [formData, setFormData] = useState({
    assignmentTitle: "", // ✅ Changed from assignmentId to assignmentTitle
    reason: "",
    additionalInfo: "",
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

      console.log("🔹 Request Headers:", headers); // Log headers

      const response = await axios.post(
        "http://localhost:5000/api/appeals",
        {
          assignmentTitle: formData.assignmentTitle, // ✅ Send assignmentTitle instead of assignmentId
          explanation: formData.reason,
          evidence: formData.additionalInfo,
        },
        { headers }
      );

      setMessage("✅ Appeal submitted successfully!");
      setFormData({ assignmentTitle: "", reason: "", additionalInfo: "" });
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
            name="assignmentTitle" // ✅ Changed name attribute
            value={formData.assignmentTitle} // ✅ Changed state variable
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-semibold mb-2">
            Reason for Appeal:
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-semibold mb-2">
            Additional Information (Optional):
          </label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
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
