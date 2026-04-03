import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      await API.post(`/accounts/reset-password/${uid}/${token}/`, {
        password
      });

      alert("Password reset successful ✅");
      navigate("/");
    } catch (err) {
      alert("Invalid or expired reset link");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleReset}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}