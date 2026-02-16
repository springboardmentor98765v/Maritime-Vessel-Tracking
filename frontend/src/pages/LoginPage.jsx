import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "operator",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setMessage("Invalid username, password, or role");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Sign in</h2>

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        {/* Role */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="role-select"
          required
        >
          <option value="operator">Operator</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Sign in</button>

        {message && <p className="message">{message}</p>}

        <p className="register-link">
          Not registered? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
