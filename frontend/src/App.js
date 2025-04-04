import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/Home";

import StudentSignup from "./pages/student/StudentSignup";
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";

import TeacherSignup from "./pages/teacher/TeacherSignup";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ViewSubmission from "./pages/teacher/dashboardComponents/ViewSubmission"; // ✅ Import ViewSubmission

  

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
        <Route path="/view-submission/:studentID/:assignmentID" element={<ViewSubmission />} />

      </Routes>
    </Router>
  );
}

export default App;
