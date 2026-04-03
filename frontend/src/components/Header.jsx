import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/axios";

export default function Header({  }) {
  const location = useLocation();
  const navigate = useNavigate();

  const dropdownRef = useRef();
  const userRef = useRef();

  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "analyst";

  const getTitle = () => {
    if (location.pathname.includes("map")) return "Live Map";
    if (location.pathname.includes("vessels")) return "Vessels";
    if (location.pathname.includes("portcharts")) return "Port Analytics";
    if (location.pathname.includes("ports")) return "Ports";
    if (location.pathname.includes("admin")) return "Admin Panel";
    return "Dashboard";
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ================= FETCH NOTIFICATIONS ================= */

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      const data = res.data.results || res.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notification error", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ================= CLOSE DROPDOWNS ================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= MARK READ ================= */

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

 return (
  <div className="header">

    {/* LEFT - LOGO + TITLE */}
    <div className="header-left">
      <div className="logo">
         <span></span>
      </div>
      <h2 className="page-title">{getTitle()}</h2>
    </div>

    {/* RIGHT SIDE */}
    <div className="profile">

      {/* 🔔 NOTIFICATIONS */}
      <div className="notif-wrapper" ref={dropdownRef}>
        <span
          className="icon-btn"
          onClick={() => setOpenNotif(!openNotif)}
        >
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}

        {openNotif && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <h4>Notifications</h4>
              {notifications.length > 0 && (
                <button
                  className="mark-all"
                  onClick={async () => {
                    await markAllNotificationsRead();
                    fetchNotifications();
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="notif-list">
              {notifications.length === 0 ? (
                <p className="no-notif">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.is_read ? "read" : "unread"}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="notif-icon">
                      {n.is_read ? "✔️" : "🔔"}
                    </div>

                    <div className="notif-content">
                      <p className="notif-message">{n.message}</p>
                      <div className="notif-meta">
                        <span>{n.vessel_name}</span>
                        <span>
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 👤 USER MENU */}
      <div className="user-wrapper" ref={userRef}>
        <div
          className="avatar"
          onClick={() => setOpenUser(!openUser)}
        >
          {username[0]?.toUpperCase()}
        </div>

        {openUser && (
          <div className="user-dropdown">

            <div className="user-info">
              <strong>{username}</strong>
              <span>{role}</span>
            </div>

            <div
              className="dropdown-item"
              onClick={() => navigate(`/${role.toLowerCase()}/profile`)}
            >
              👤 View Profile
            </div>

            
          </div>
        )}
      </div>
      <div className="logout-btn" onClick={logout}>
              Logout
            </div>

    </div>
  </div>
)};