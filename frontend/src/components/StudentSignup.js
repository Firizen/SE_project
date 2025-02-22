import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StudentSignup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", studentClass: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/student/signup", formData);
      alert("Student Registered Successfully! Please login.");
      navigate("/student/login");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div>
      <h2>Student Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <input type="text" name="studentClass" placeholder="Class" required onChange={handleChange} />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default StudentSignup;
