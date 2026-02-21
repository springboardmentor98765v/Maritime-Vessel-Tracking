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

  const [showPassword, setShowPassword] = useState(false);

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

        <div style={{ position: 'relative', width: '100%' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={handleChange}
            required
            style={{ paddingRight: 48 }}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              zIndex: 2
            }}
          >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 013.153-4.278M6.1 6.1L17.9 17.9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                </svg>
              )}
          </button>
        </div>

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
