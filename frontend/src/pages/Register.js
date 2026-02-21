import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "operator"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    
    // Client-side validation
    if (!form.username || form.username.trim().length < 3) {
      alert("Username is required and must be at least 3 characters long.");
      return;
    }
    
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      alert("A valid email address is required.");
      return;
    }
    
    if (!form.password || form.password.length < 6) {
      alert("Password is required and must be at least 6 characters long.");
      return;
    }

    try {

      await API.post("auth/register/", form);

      alert("Registration Successful");
      navigate("/");

    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("Registration failed: " + (error.response.data.message || "Invalid data provided."));
      } else if (error.response && error.response.status === 409) {
        alert("Registration failed: Username or email already exists.");
      } else {
        alert("Registration failed: Server error occurred.");
      }
    }

  };

  return (
    <div className="register-container">

      <form className="register-card" onSubmit={handleSubmit}>

        <h2 className="register-title">🚢 Maritime Vessel Tracking</h2>
        <p className="register-subtitle">Create your account</p>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <select name="role" onChange={handleChange}>
          <option value="operator">Operator</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" className="register-btn">
          Register
        </button>

        <p className="login-text">
          Already have an account?
          <span onClick={() => navigate("/")}> Login</span>
        </p>

      </form>

    </div>
  );
}

export default Register;
