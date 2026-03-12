import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchExtraProfile,
  updateExtraProfile,
} from "../services/authService";
import "../index.css";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function UpdateProfile() {
  const navigate = useNavigate();

  // -------------------- STATE --------------------
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    company: "",
    phone_number: "",
    bio: "",
    avatar: null,
  });

  // 👇 NEW STATE FOR IMAGE PREVIEW
  const [avatarPreview, setAvatarPreview] = useState(null);

  // -------------------- FETCH PROFILE --------------------
  useEffect(() => {
    fetchExtraProfile()
      .then((data) => {
        setForm({
          company: data.company || "",
          phone_number: data.phone_number || "",
          bio: data.bio || "",
          avatar: null,
        });

        // 👇 SET EXISTING IMAGE
        if (data.avatar) {
  setAvatarPreview(`${BASE_URL}${data.avatar}`);
}
      })
      .finally(() => setLoading(false));
  }, []);

  // -------------------- HANDLE CHANGE --------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar") {
      const file = files[0];
      setForm({ ...form, avatar: file });

      // 👇 SHOW NEW PREVIEW
      if (file) {
        setAvatarPreview(URL.createObjectURL(file));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // -------------------- SUBMIT --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("company", form.company);
    formData.append("phone_number", form.phone_number);
    formData.append("bio", form.bio);

    if (form.avatar) {
      formData.append("avatar", form.avatar);
    }

    try {
      await updateExtraProfile(formData);
      alert("Profile updated successfully");
      navigate("/profile");
    } catch {
      alert("Failed to update profile");
    }
  };

  // -------------------- LOADING --------------------
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-300">
        Loading profile...
      </div>
    );
  }

  // -------------------- UI --------------------
  return (
    <div className="min-h-[70vh] flex items-start justify-start pt-20">
      <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-xl
                      border border-white/10 rounded-2xl shadow-2xl shadow-slate-950/50 p-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Update Profile
        </h2>
        <p className="text-slate-400 mb-6">
          Update your personal information
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview */}
          {avatarPreview && (
            <div className="flex justify-center mb-4">
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-cyan-500/50 shadow-lg shadow-cyan-500/30"
              />
            </div>
          )}

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Company
            </label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Maritime Corp"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70
                         text-white border border-slate-600/50
                         placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70
                         text-white border border-slate-600/50
                         placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us about yourself"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/70
                         text-white border border-slate-600/50
                         placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         transition-all"
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Profile Image
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-slate-300
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:bg-gradient-to-r file:from-cyan-400 file:to-blue-500
                         file:text-slate-900 file:font-semibold
                         hover:file:shadow-lg hover:file:shadow-cyan-500/30
                         file:transition-shadow"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500
                         hover:-translate-y-0.5 transition-transform
                         text-slate-900 font-semibold shadow-lg shadow-cyan-500/30"
            >
              Save Changes
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
