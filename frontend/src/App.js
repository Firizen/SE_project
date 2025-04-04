import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import HomePage from "./components/Home";

import StudentSignup from "./pages/student/StudentSignup";
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";

import TeacherSignup from "./pages/teacher/TeacherSignup";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ViewPlagiarismResults from "./pages/teacher/dashboardComponents/ViewPlagiarismResults";
import PlagiarismResultsPage from "./pages/teacher/dashboardComponents/PlagiarismResultsPage";


import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";


const socket = io("http://localhost:5000");

function App() {
  const [similarityResults, setSimilarityResults] = useState([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    socket.on("similarityResultsUpdated", (results) => {
      setSimilarityResults(results);
      setChecking(false);
    });
    return () => socket.off("similarityResultsUpdated");
  }, []);

  const handleCheckSimilarity = async (threshold) => {
    setChecking(true);
    try {
      const response = await fetch("http://localhost:5000/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold }),
      });
      if (!response.ok) {
        throw new Error("Failed to trigger similarity check");
      }
      const data = await response.json();
      setSimilarityResults(data); // Update state with results
    } catch (error) {
      console.error("Error checking similarity:", error);
      setChecking(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/teacher/signup" element={<TeacherSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard onCheckSimilarity={handleCheckSimilarity} checking={checking} similarityResults={similarityResults} />} />
        //<Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/plagiarism-results" element={<ViewPlagiarismResults />} />
        <Route path="/teacher/plagiarism-results/:assignmentId" element={<PlagiarismResultsPage />} />


      </Routes>
    </Router>
  );
}

export default App;