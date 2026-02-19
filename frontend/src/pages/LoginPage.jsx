import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <section className="grid lg:grid-cols-2 gap-10 items-center text-white min-h-[600px]">
      {/* Info Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-slate-300">Sign in to access your maritime dashboard</p>
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-600/30">
          <p className="text-sm">Access live vessel tracking, port analytics, and safety overlays to monitor your fleet operations in real-time.</p>
        </div>
      </div>
      
      {/* Auth Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-slate-950/50">
        <h2 className="text-2xl font-bold mb-2">Sign in</h2>
        <p className="text-slate-400 mb-6">Enter your credentials</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Username</label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Role Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            >
              <option value="operator">Operator</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Error Message */}
          {message && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-sm">
              {message}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 transition-transform">
            Sign in
          </button>
        </form>
        
        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Not registered?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
