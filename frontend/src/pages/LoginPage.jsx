import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../index.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);
      setMessage("Login successful!");
      console.log(res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
    } catch (err) {
      setMessage("Invalid credentials");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Sign in</h2>

        <input
          type="email"
          name="email"
          placeholder="Work email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="role-select"
        >
          <option value="operator">Operator</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>

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

        {/* Create account link */}
        <p className="register-link">
          Not registered?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
