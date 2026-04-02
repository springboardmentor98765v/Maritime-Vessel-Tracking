import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  User,
  Ship,
  BarChart,
  Shield
} from "lucide-react"

import { logout } from "../../stores/slices/authSlice"

export default function Sidebar() {

  const [collapsed, setCollapsed] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state) => state.auth?.user)

  const role = user?.role || "viewer"

  const handleLogout = () => {
    localStorage.removeItem(import.meta.env.VITE_JWT_TOKEN_KEY)
    localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY)
    dispatch(logout())
    navigate("/", { replace: true })
  }

  const menuItems = [

    {
      to: "/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      roles: ["admin", "operator", "viewer"]
    },

    {
      to: "/users",
      icon: <Users size={18} />,
      label: "Users",
      roles: ["admin"]
    },

    {
      to: "/profile",
      icon: <User size={18} />,
      label: "Profile",
      roles: ["admin", "operator", "viewer"]
    },

    {
      to: "/voyages",
      icon: <Ship size={18} />,
      label: "Voyage History",
      roles: ["admin", "operator"]
    },

    {
      to: "/vessels",
      icon: <Ship size={18} />,
      label: "Vessels",
      roles: ["admin", "operator", "viewer"]
    },

    {
      to: "/analytics",
      icon: <BarChart size={18} />,
      label: "Port Analytics",
      roles: ["admin"]
    },

    // ✅ NEW PORT STATISTICS MENU
    {
      to: "/port-statistics",
      icon: <BarChart size={18} />,
      label: "Port Statistics",
      roles: ["admin"]   // change roles if needed
    },

    {
      to: "/reports",
      icon: <FileText size={18} />,
      label: "Reports",
      roles: ["admin", "operator", "viewer"]
    },

    {
      to: "/safety",
      icon: <Shield size={18} />,
      label: "Safety",
      roles: ["admin", "operator"]
    },

    {
      to: "/settings",
      icon: <Settings size={18} />,
      label: "Settings",
      roles: ["admin"]
    }

  ]

  const filteredMenu = menuItems.filter(item =>
    item.roles.includes(role)
  )

  return (

    <div
      className={`h-screen bg-[#0b1220] text-white flex flex-col transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}`}
    >

      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">

        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Maritime</h2>
            <p className="text-xs text-white/60">
              Tracking Platform
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white"
        >
          <Menu size={20} />
        </button>

      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2">

        {filteredMenu.map((menu) => (

          <SidebarLink
            key={menu.to}
            to={menu.to}
            icon={menu.icon}
            label={menu.label}
            collapsed={collapsed}
          />

        ))}

      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-3 border-t border-white/10 text-xs text-white/60">

          Logged in as:
          <div className="text-white font-semibold">
            {user.username || user.name}
          </div>

          <div className="capitalize">
            Role: {role}
          </div>

        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-white/10">

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-600/90 transition"
        >

          <LogOut size={18} />

          {!collapsed && (
            <span className="text-sm">
              Logout
            </span>
          )}

        </button>

      </div>

    </div>

  )

}


/* SidebarLink Component */

function SidebarLink({ to, icon, label, collapsed }) {

  return (

    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200
        ${isActive
          ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm"
          : "text-white/75 hover:bg-white/10 hover:text-white"}`
      }
    >

      {icon}

      {!collapsed && (
        <span className="text-sm">
          {label}
        </span>
      )}

    </NavLink>

  )

}
