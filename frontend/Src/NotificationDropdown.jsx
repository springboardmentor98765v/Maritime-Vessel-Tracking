import { useEffect, useState, useRef } from 'react';
import { fetchNotifications, markNotificationRead } from '../services/api';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {}
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '22px',
          position: 'relative',
          color: '#fff'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-6px',
            background: 'red',
            color: '#fff',
            borderRadius: '50%',
            fontSize: '11px',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '36px',
          background: '#1e2a3a',
          width: '300px',
          maxHeight: '380px',
          overflowY: 'auto',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 1000,
          padding: '10px'
        }}>
          <h4 style={{ color: '#fff', marginBottom: '10px' }}>🔔 Notifications</h4>

          {notifications.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center' }}>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '10px',
                  marginBottom: '6px',
                  background: n.is_read ? '#2e3d4f' : '#0d47a1',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              >
                <p style={{ margin: '0 0 6px' }}>{n.message}</p>
                <small style={{ color: '#aaa' }}>{new Date(n.created_at).toLocaleString()}</small>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      display: 'block',
                      marginTop: '6px',
                      padding: '4px 10px',
                      background: '#42a5f5',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
