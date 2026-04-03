import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match ❌");
    return;
  }

  try {

    const data = {
  username: formData.name,
  email: formData.email,
  password1: formData.password,
  password2: formData.confirmPassword,
  role: formData.role,
};
await API.post("/accounts/register/", data);

    alert("Registration Successful ✅");

    navigate("/");

  } catch (error) {

    console.log("REGISTER ERROR:", error?.response?.data || error.message);

    alert(JSON.stringify(error?.response?.data));

  }
};

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="username"
            required
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="analyst">Analyst</option>
          </select>

          <button type="submit">Register</button>
        </form>

        <p onClick={() => navigate("/")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}