import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../services/authService";
import "../index.css";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=256";

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile()
      .then((res) => setData(res))
      .catch((err) => console.error("Profile fetch failed:", err));
  }, []);

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        Loading profile...
      </div>
    );
  }

  const profile = data.profile || {};

  // ✅ Avatar handling
  const avatar = profile.avatar
    ? `http://127.0.0.1:8000${profile.avatar}`
    : DEFAULT_AVATAR;

  return (
    <div className="min-h-[80vh] pt-24 flex justify-center">
      <div className="max-w-3xl w-full bg-slate-900/80 backdrop-blur-md 
                      border border-slate-700 rounded-3xl shadow-2xl p-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <img
            src={avatar}
            alt="Profile Avatar"
            className="w-10 h-10 rounded-full border-4 border-cyan-500 
                       object-cover shadow-lg"
          />

          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white">
              {data.username}
            </h2>

            <p className="text-slate-400 mt-1">{data.email}</p>

            <span className="inline-block mt-3 px-4 py-1.5 text-sm 
                             rounded-full bg-cyan-500/20 text-cyan-400">
              {data.role}
            </span>
          </div>
        </div>

        {/* ================= BIO ================= */}
        {profile.bio && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-white mb-2">
              About
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* ================= DETAILS ================= */}
        {(profile.company || profile.phone_number) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            
            {profile.company && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Company</p>
                <p className="text-white font-medium">
                  {profile.company}
                </p>
              </div>
            )}

            {profile.phone_number && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Phone</p>
                <p className="text-white font-medium">
                  {profile.phone_number}
                </p>
              </div>
            )}

          </div>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/profile/update")}
            className="flex-1 py-3 rounded-xl bg-cyan-600 
                       hover:bg-cyan-500 transition 
                       text-white font-semibold"
          >
            Edit Profile
          </button>

          <button
            onClick={() => navigate("/profile/change-password")}
            className="flex-1 py-3 rounded-xl border border-slate-600 
                       text-slate-300 hover:bg-slate-800 transition"
          >
            Change Password
          </button>
        </div>

      </div>
    </div>
  );
}
