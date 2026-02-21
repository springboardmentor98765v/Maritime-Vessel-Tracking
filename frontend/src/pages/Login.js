import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    
    // Client-side validation
    if (!form.username.trim()) {
      alert("Username is required.");
      return;
    }
    
    if (!form.password) {
      alert("Password is required.");
      return;
    }
    
    if (form.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {

      const res = await API.post("auth/login/", form);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Invalid credentials. Please check your username and password.");
      } else if (error.response && error.response.status === 400) {
        alert("Bad request. Please check your input.");
      } else if (error.response && error.response.status >= 500) {
        alert("Server error. Please try again later.");
      } else {
        alert("Network error or server unavailable. Please try again.");
      }
    }

  };

  return (
    <div className="login-container">

      <form className="login-card" onSubmit={handleSubmit}>

        <h2 className="login-title">🚢 Maritime Vessel Tracking</h2>
        <p className="login-subtitle">Login to continue</p>

        <input
          name="username"
          placeholder="Username"
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

        <button type="submit" className="login-btn">
          Login
        </button>

        <p className="register-text">
          New user?
          <span onClick={() => navigate("/register")}> Register</span>
        </p>

      </form>

    </div>
  );
}

export default Login;
