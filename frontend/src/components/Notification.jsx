import { useEffect, useState } from "react";
//import {getNotifications,markAllNotificationsRead} from "../api/axios";


export default function Notification() {
  const [notifications, setNotifications] = useState([]);

const fetchNotifications = async () => {
  try {
    setLoading(true);

    const res = await getNotifications();
    setNotifications(res.data);

  } catch (err) {
    console.error("Notification fetch error", err);
  } finally {
    setLoading(false);
  }
};
const [loading, setLoading] = useState(true);


  useEffect(() => {

  fetchNotifications();

  const interval = setInterval(fetchNotifications, 10000);

  return () => clearInterval(interval);

}, []);
if (loading) return <p>Loading notifications...</p>;

  return (

    <div className="notification-page">

      <h2>Notifications</h2>
      

      {notifications.length === 0 ? (

        <p>No notifications</p>

      ) : (

        notifications.map(n => (
          <div
  key={n.id}
  className={`notification-card ${n.is_read ? "read" : "unread"}`}
>
        
  <div className="notif-content">
    <p>{n.message}</p>
    <div className="notif-meta">
      <span>{n.vessel_name || "N/A"}</span>
      <span>{new Date(n.created_at).toLocaleString()}</span>
    </div>
  </div>
</div>

        ))

      )}

    </div>

  );

}