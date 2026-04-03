import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Profile() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState(username);
  const [newEmail, setNewEmail] = useState(email);
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await API.post("/accounts/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error("Password change failed");
    }
  };
const handleUpdateProfile = async () => {
  try {
    const res = await API.patch("/api/me/", {
      username: newUsername,
      email: newEmail,
    });

    toast.success("Profile updated ✅");

    // update localStorage
    localStorage.setItem("username", res.data.username);
    localStorage.setItem("email", res.data.email);

    window.location.reload(); // refresh UI
  } catch (err) {
    toast.error("Update failed ❌");
  }
};

 return (
  <div className="profile-container">

    {/* PROFILE CARD */}
    <div className="profile-card-premium">
      <div className="profile-top">
        <div className="avatar-lg">
          {username?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2>{username}</h2>
          <p className="role-badge">{role}</p>
          <p className="email">{email}</p>
        </div>
      </div>

      <div className="profile-info-grid">
        <div>
          <label>Username</label>
          <p>{username}</p>
        </div>
        <div>
          <label>Email</label>
          <p>{email}</p>
        </div>
        <div>
          <label>Role</label>
          <p className="role-highlight">{role}</p>
        </div>
      </div>
    </div>
    <div className="password-card-premium">
  <h3>👤 Update Profile</h3>

  <div className="input-group">
    <input
      type="text"
      placeholder=" "
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
    />
    <label>Username</label>
  </div>

  <div className="input-group">
    <input
      type="email"
      placeholder=" "
      value={newEmail}
      onChange={(e) => setNewEmail(e.target.value)}
    />
    <label>Email</label>
  </div>

  <button onClick={handleUpdateProfile}>
    Update Profile
  </button>
</div>

    {/* PASSWORD CARD */}
    <div className="password-card-premium">
      <h3>🔐 Change Password</h3>

      <div className="input-group">
        <input
          type="password"
          placeholder=" "
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <label>Old Password</label>
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder=" "
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <label>New Password</label>
      </div>

      <button onClick={handleChangePassword}>
        Update Password
      </button>
    </div>

  </div>
)};