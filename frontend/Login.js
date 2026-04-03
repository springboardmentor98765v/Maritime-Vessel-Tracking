import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── Try real backend first ──
    try {
      const baseUrl = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";
      const res = await fetch(`${baseUrl}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data  = await res.json();
        const token = data.access || data.token || "demo-token";
        localStorage.setItem("token", token);
        navigate("/dashboard");
        return;
      }
    } catch {
      // Backend not reachable — fall through to demo
    }

    // ── Demo credentials fallback ──
    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("token", "demo-token");
      navigate("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        {/* Logo */}
        <span className="auth-logo">🚢</span>
        <h2>Maritime Tracking</h2>
        <p className="auth-subtitle">Sign in to your dashboard</p>

        {/* Error */}
        {error && <div className="auth-error">⚠ {error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <label className="auth-label">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="auth-label">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button id="login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;