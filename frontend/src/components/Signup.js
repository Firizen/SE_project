import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [extraField, setExtraField] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    const body = { name, email, password, [role === "student" ? "studentClass" : "subject"]: extraField };

    const response = await fetch(`http://localhost:5000/api/auth/signup/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (response.ok) {
      alert(`${role} signed up successfully`);
      navigate(`/login/${role}`);
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h2>{role === "student" ? "Student Sign Up" : "Teacher Sign Up"}</h2>

      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <input
          type="text"
          placeholder={role === "student" ? "Class (e.g., 10A)" : "Subject"}
          onChange={(e) => setExtraField(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>

      <p>Already have an account? <button onClick={() => navigate(`/login/${role}`)}>Login</button></p>
    </div>
  );
}

export default Signup;
