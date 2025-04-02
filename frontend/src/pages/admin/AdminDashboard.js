import { useState } from "react";
import ManageUsers from "./dashboardComponents/ManageUsers";
import ViewPlagiarismResults from "./dashboardComponents/ViewPlagiarismResults";
import RegularPlagiarismCheck from "./dashboardComponents/RegularPlagiarismCheck";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState(null);
  const [similarityResults, setSimilarityResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const admin = JSON.parse(localStorage.getItem("adminDetails")) || { name: "Admin", email: "admin@example.com" };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminDetails");
    window.location.href = "/admin/login";
  };

  const onCheckSimilarity = async () => {
    try {
      console.log("🔍 Running Plagiarism Check...");
      setShowResults(false); // Hide previous results while checking

      // Run similarity check
      await axios.post("http://localhost:5000/api/similarity", { threshold: 30 });

      // Fetch updated results
      const response = await axios.get("http://localhost:5000/api/plagiarism-results");

      if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
        setSimilarityResults(response.data.results);
        setShowResults(true); // Show results after checking
        console.log("✅ Similarity Results:", response.data.results);
      } else {
        setSimilarityResults([]);
        setShowResults(true); // Show "No results" message
        console.warn("⚠️ No valid results found.");
      }
    } catch (error) {
      console.error("❌ Error running similarity check:", error);
      setShowResults(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="w-full bg-red-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold font-serif">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div 
            className="relative" 
            onMouseEnter={() => setShowDropdown(true)} 
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="bg-white text-black px-4 py-2 font-semibold rounded-md hover:bg-gray-300 transition">
              View Details
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black p-4 shadow-lg rounded-md">
                <p className="font-semibold">Name: {admin.name}</p>
                <p className="text-gray-600">Email: {admin.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-white text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-300 transition">
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Layout */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white flex flex-col p-4 space-y-4">
          <button 
            onClick={() => setActiveSection(activeSection === "plagiarism" ? null : "plagiarism")} 
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            Check Assignments
          </button>
          <button 
            onClick={() => setActiveSection(activeSection === "manageUsers" ? null : "manageUsers")} 
            className="py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            Manage Users
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 mt-4">
          {activeSection === "plagiarism" && (
            <RegularPlagiarismCheck 
              onCheckSimilarity={onCheckSimilarity} 
              similarityResults={similarityResults} 
            />
          )}
          {activeSection === "plagiarism" && <ViewPlagiarismResults />} //might need to remove this, based on conflict
          {activeSection === "manageUsers" && <ManageUsers />}

          {/* Display Plagiarism Results in Table ONLY after running the check */}
          {showResults && (
            <div className="mt-5">
              <h3 className="text-xl font-semibold mb-2">Stored Plagiarism Results</h3>
              {similarityResults.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-300 shadow-lg">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-4 py-2">Submission ID</th>
                      <th className="border px-4 py-2">Student 1</th>
                      <th className="border px-4 py-2">Student 2</th>  
                      <th className="border px-4 py-2">Similarity (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {similarityResults.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-100 transition">
                        <td className="border px-4 py-2">{result.submissionID}</td>
                        <td className="border px-4 py-2">{result["Student 1"]}</td>
                        <td className="border px-4 py-2">{result["Student 2"]}</td>
                        <td className="border px-4 py-2 font-bold text-red-600">
                          {result["Similarity (%)"]}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">No similarities found.</p>
              )}
            </div>
          )}


          {/* Default Home Page */}
          {activeSection === null && (
            <div className="flex content-start">
              <div className="bg-white p-6 rounded-lg shadow-lg w-8/12 mr-20">
                <h2 className="text-4xl font-semibold text-gray-700">Welcome, {admin.name}!</h2>
                <p className="text-gray-500 mt-2 mb-2">Manage plagiarism results and user accounts from this dashboard.</p>
                <div className="border-b-2 border-gray-300 w-10/12 mt-2"></div>
                <p className="text-gray-800 text-xl mt-6">Announcements: </p>
              </div>
              <div className="mt-6 items-start">
                <Calendar className="shadow-lg rounded-md p-4 bg-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
