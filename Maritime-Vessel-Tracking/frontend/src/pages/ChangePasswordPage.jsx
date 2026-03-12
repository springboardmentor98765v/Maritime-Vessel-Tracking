import { useState, useEffect } from "react";
import { changePassword } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    captcha: "",
  });

  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState({ a: 0, b: 0 });

  // Generate captcha
  const generateCaptcha = () => {
    setCaptcha({
      a: Math.floor(Math.random() * 10) + 1,
      b: Math.floor(Math.random() * 10) + 1,
    });
    setForm((prev) => ({ ...prev, captcha: "" }));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateCaptcha();
  }, []);

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (!validatePassword(form.new_password)) {
      setError(
        "Password must be 8+ chars, include uppercase, lowercase, number & special character."
      );
      return;
    }

    // Captcha validation
    if (parseInt(form.captcha) !== captcha.a + captcha.b) {
      setError("Captcha answer is incorrect.");
      generateCaptcha();
      return;
    }

    try {
      await changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
      });

      alert("Password changed successfully. Please login again.");
      navigate("/login");
    } catch {
      setError("Old password is incorrect or new password is invalid.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-slate-950/50 p-8">

        <h2 className="text-3xl font-bold text-white mb-2">
          Change Password
        </h2>
        <p className="text-slate-400 mb-6">
          Keep your account secure
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Old Password
            </label>
            <input
              type="password"
              name="old_password"
              value={form.old_password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white border border-slate-600/50
                         placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white border border-slate-600/50
                         placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Min 8 chars, uppercase, lowercase, number & special character
            </p>
          </div>

          {/* CAPTCHA */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Captcha: {captcha.a} + {captcha.b} = ?
            </label>
            <input
              type="text"
              name="captcha"
              value={form.captcha}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white border border-slate-600/50
                         placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500
                         hover:-translate-y-0.5 transition-transform
                         text-slate-900 font-semibold shadow-lg shadow-cyan-500/30"
            >
              Update Password
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 py-3 rounded-xl border border-white/30
                         text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
