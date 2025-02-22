import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ role }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/auth/login/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(`${role} logged in successfully`);
      localStorage.setItem("token", data.token);
      navigate(`/${role}/dashboard`);
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h2>{role === "student" ? "Student Login" : "Teacher Login"}</h2>

      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>

      <p>Don't have an account? <button onClick={() => navigate(`/signup/${role}`)}>Sign Up</button></p>
    </div>
  );
}

export default Login;
