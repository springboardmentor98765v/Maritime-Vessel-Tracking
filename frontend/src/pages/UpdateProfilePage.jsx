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
      <div className="max-w-lg w-full bg-slate-900/80 backdrop-blur-md
                      border border-slate-700 rounded-2xl shadow-2xl p-8">
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
                className="w-24 h-24 rounded-full object-cover border border-slate-600"

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
              className="w-full px-4 py-3 rounded-xl bg-slate-800
                         text-white border border-slate-600
                         focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="w-full px-4 py-3 rounded-xl bg-slate-800
                         text-white border border-slate-600
                         focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="w-full px-4 py-3 rounded-xl bg-slate-800
                         text-white border border-slate-600
                         focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                         file:bg-cyan-600 file:text-white
                         hover:file:bg-cyan-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-cyan-600
                         hover:bg-cyan-500 transition
                         text-white font-semibold"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 py-3 rounded-xl border border-slate-600
                         text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
