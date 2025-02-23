import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


function TeacherSignup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/teacher/signup", formData);
      alert("Teacher Registered Successfully! Please login.");
      navigate("/teacher/login");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div>
      <h2>Teacher Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <button type="submit">Sign Up</button>
      </form>
      <Link to="/"><button>Back</button></Link>
    </div>
  );
}

export default TeacherSignup;
