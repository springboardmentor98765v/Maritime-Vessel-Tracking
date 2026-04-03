import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
        // 1) get token
      const res = await API.post("/api/token/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // 2) get role from backend
      const meRes = await API.get("/api/me/", {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });

      const userData = meRes.data;

      localStorage.setItem("role", userData.role);
      localStorage.setItem("username", userData.username);
      localStorage.setItem("email", userData.email);

      // 3) redirect based on REAL role
      if (userData.role === "admin") navigate("/admin");
      else if (userData.role === "operator") navigate("/operator");
      else if (userData.role === "analyst") navigate("/analyst");
      else navigate("/");

    } catch (err) {
      console.log("LOGIN ERROR:", err?.response?.data || err.message);
      alert("Invalid credentials ❌");
    }
  };
  
  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2> Login</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        

        <button type="submit">Login</button>
        <p
  className="link"
  onClick={() => navigate("/forgot-password")}
>
  Forgot Password?
</p>

        <p onClick={() => navigate("/register")} className="link">
          Create Account
        </p>
      </form>
    </div>
  );
}

