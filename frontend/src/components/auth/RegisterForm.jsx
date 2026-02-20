import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const initialState = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  role: "operator",
  password: "",
};

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formState, setFormState] = useState(initialState);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await register(formState);
      setStatus("success");
      navigate("/dashboard");
    } catch (err) {
      setStatus("error");
      // Extract a readable message from the API response if available
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === "object") {
        const messages = Object.entries(apiErrors)
          .map(([field, msgs]) => {
            const text = Array.isArray(msgs) ? msgs.join(" ") : msgs;
            return field === "non_field_errors" ? text : `${field}: ${text}`;
          })
          .join(" | ");
        setError(messages || "Registration failed. Please try again.");
      } else {
        setError("Unable to connect to the server. Is the backend running?");
      }
    }
  };

  return (
    <form className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-slate-950/50" onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create account</h2>
        <p className="text-slate-400">
          Start tracking vessels in minutes.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Username</label>
          <input
            type="text"
            name="username"
            placeholder="alexmorgan"
            value={formState.username}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">First name</label>
          <input
            type="text"
            name="first_name"
            placeholder="Alex"
            value={formState.first_name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Last name</label>
          <input
            type="text"
            name="last_name"
            placeholder="Morgan"
            value={formState.last_name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Work email</label>
          <input
            type="email"
            name="email"
            placeholder="analyst@portauthority.com"
            value={formState.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Role</label>
          <select
            name="role"
            value={formState.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          >
            <option value="operator">Operator</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a secure password"
            value={formState.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Creating account..."
            : "Create account"}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
