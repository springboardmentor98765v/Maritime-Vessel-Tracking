import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // ── Try real backend first ──
    try {
      const baseUrl = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";
      const res = await fetch(`${baseUrl}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        navigate("/");
        return;
      }
    } catch {
      // Backend not reachable — fall through to local save
    }

    // ── Demo fallback — save locally ──
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        {/* Logo */}
        <span className="auth-logo">⚓</span>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the Maritime Tracking Platform</p>

        {/* Error */}
        {error && <div className="auth-error">⚠ {error}</div>}

        {/* Form */}
        <form onSubmit={handleRegister}>
          <label className="auth-label">Full Name</label>
          <input
            id="register-name"
            type="text"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="auth-label">Email Address</label>
          <input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="auth-label">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="auth-label">Confirm Password</label>
          <input
            id="register-confirm"
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button id="register-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;