import Sidebar from "./Sidebar";
import Header from "../components/Header"
import { Outlet } from "react-router-dom";
import "../pages/admin.css";
//import Notification from "./Notification";

export default function Layout({ role }) {
  return (
    <div className="admin-container">

      {/* Sidebar stays ALWAYS */}
      <Sidebar role={role} />

      {/* Page content changes here */}
      <div className="main-content">
        <Header/>
        <div style={{padding: "20px"}}>
        <Outlet />
        </div>
      </div>

    </div>
  );
}