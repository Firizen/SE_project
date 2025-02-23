import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentLogin from "./components/StudentLogin";
import TeacherLogin from "./components/TeacherLogin";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentSignup from "./components/StudentSignup";
import TeacherSignup from "./components/TeacherSignup";
import HomePage from "./components/Home";  // Add this if needed

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
      </Routes>
    </Router>
  );
}

export default App;
