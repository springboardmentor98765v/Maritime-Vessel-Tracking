import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { Bell, User, LogOut } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"

import { logout } from "../../stores/slices/authSlice"

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth?.user)

  const userRole = user?.role || "operator"

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", allowed: ["operator", "analyst", "admin"] },
    { to: "/voyages", label: "Voyage History", allowed: ["operator", "analyst", "admin"] },
    { to: "/vessels", label: "Vessels", allowed: ["operator", "analyst", "admin"] },
    { to: "/analytics", label: "Port Analytics", allowed: ["analyst", "admin"] },
    { to: "/safety", label: "Safety", allowed: ["analyst", "admin"] },
    { to: "/reports", label: "Reports", allowed: ["analyst", "admin"] },
  ]

  // Dynamic page title
  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard"
        case "/home":
        return "Home"
      case "/admin":
        return "Admin Panel"
      case "/tracking":
        return "Live Tracking"
      case "/vessels":
        return "Vessels"
      case "/alerts":
        return "Alerts"
      case "/analytics":
        return "Analytics"
      default:
        return "Maritime Admin"
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(import.meta.env.VITE_JWT_TOKEN_KEY)
    localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY)
    dispatch(logout())
    navigate("/", { replace: true })
  }

  return (
    <div className="h-16 bg-[#020617]/95 backdrop-blur border-b border-emerald-900/70 flex items-center justify-between px-4 md:px-6">

      {/* Brand + nav buttons */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col">
          <h1 className="text-sm font-semibold tracking-[0.12em] uppercase text-emerald-400/90">
            Maritime Platform
          </h1>
          <p className="text-xs text-emerald-200/80">
            {getTitle()}
          </p>
        </div>

        <nav className="flex items-center gap-2 md:gap-3">
          {menuItems.map((item) => {
            const hasAccess = item.allowed.includes(userRole)
            return (
              <NavLink
                key={item.to}
                to={hasAccess ? item.to : "#"}
                onClick={(e) => {
                  if (!hasAccess) {
                    e.preventDefault()
                    alert(`Access Restricted: Only ${item.allowed.join(' or ')} accounts can access ${item.label}.`)
                  }
                }}
                className={({ isActive }) =>
                  [
                    "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all",
                    "border border-transparent",
                    "hover:border-emerald-500/80 hover:bg-emerald-950/70",
                    (isActive && hasAccess)
                      ? "bg-emerald-600 text-emerald-50 shadow-md"
                      : "text-emerald-100/80",
                    !hasAccess && "opacity-70 cursor-not-allowed"
                  ].filter(Boolean).join(" ")
                }
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-6 relative">
        {/* Alerts */}
        <button
          onClick={() => navigate("/alerts")}
          className="relative cursor-pointer p-2 rounded-full hover:bg-emerald-950/70 border border-emerald-800/60 text-emerald-100/80 hover:text-emerald-300 transition"
          title="Alerts"
        >
          <Bell size={18} />
        </button>

        {/* Profile */}
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center shadow-md">
            <User size={15} />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-emerald-50">
              {user?.username || "User"}
            </span>
            <span className="text-xs text-emerald-300/80 capitalize">
              {user?.role || "viewer"}
            </span>
          </div>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-12 w-48 bg-[#020617] shadow-xl rounded-xl border border-emerald-900/70 overflow-hidden">
            <button
              onClick={() => {
                if (userRole !== "admin") {
                  alert("Access Restricted: Only admin accounts can view the Admin Panel.")
                } else {
                  navigate("/admin")
                }
              }}
              className="w-full text-left px-4 py-2 hover:bg-emerald-950/70 text-sm text-emerald-100/90"
            >
              Admin Panel
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-red-950/50 text-sm text-red-400 flex items-center gap-2"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
