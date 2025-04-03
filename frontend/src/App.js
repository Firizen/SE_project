import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

  

function App() {
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
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/aiplagiarism-results" element={<ViewPlagiarismResults />} />
        <Route path="/aiplagiarism-results/:assignmentId" element={<PlagiarismResultsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
