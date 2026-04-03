import { useState } from "react";
import API from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await API.post("/accounts/forgot-password/", {
        email: email,
      });

      alert("Password reset link sent to your email 📧");

    } catch (err) {
        if (err.response?.status === 404) {
          alert("User with this email does not exist");
        } else {
          alert("Email service error. Check backend.");
        }
      }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSubmit}>
          Send Reset Link
        </button>
      </div>
    </div>
  );
}