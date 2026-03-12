import { useNavigate } from "react-router-dom";
import API from "../services/api";   
import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await API.post("auth/logout/", {
        refresh: localStorage.getItem("refresh")
      });
    } catch (error) {
      console.log("Logout API failed");
    }

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-title">
          🚢 Maritime Vessel Tracking Dashboard
        </h2>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
