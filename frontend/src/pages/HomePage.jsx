import React from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import {
  LayoutDashboard,
  Ship,
  BarChart,
  Shield,
  FileText,
  Users
} from "lucide-react"

export default function HomePage() {

  const navigate = useNavigate()

  const user = useSelector(
    (state) => state.auth?.user
  )

  const role = user?.role || "analyst"


  // Role-based cards
  const cards = [

    {
      title: "Dashboard",
      icon: <LayoutDashboard size={26} />,
      path: "/dashboard",
      color: "bg-blue-600",
      roles: ["admin", "operator", "analyst"]
    },

    {
      title: "Voyage History",
      icon: <Ship size={26} />,
      path: "/voyages",
      color: "bg-green-600",
      roles: ["admin", "operator"]
    },

    {
      title: "Port Analytics",
      icon: <BarChart size={26} />,
      path: "/analytics",
      color: "bg-purple-600",
      roles: ["admin", "analyst"]
    },

    {
      title: "Safety Monitoring",
      icon: <Shield size={26} />,
      path: "/safety",
      color: "bg-red-600",
      roles: ["admin", "operator"]
    },

    {
      title: "Reports",
      icon: <FileText size={26} />,
      path: "/reports",
      color: "bg-orange-600",
      roles: ["admin", "operator", "analyst"]
    },

    {
      title: "Users Management",
      icon: <Users size={26} />,
      path: "/users",
      color: "bg-indigo-600",
      roles: ["admin"]
    }

  ]


  // Filter cards based on role
  const visibleCards =
    cards.filter(card =>
      card.roles.includes(role)
    )


  return (

    <div className="p-6 bg-slate-100 min-h-screen">

      {/* Welcome */}

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {user?.username || "Maritime User"}
      </h1>

      <p className="text-gray-600 mb-6">
        Role:
        <span className="ml-2 font-semibold text-blue-600">
          {role.toUpperCase()}
        </span>
      </p>



      {/* Stats Section */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        <StatCard
          title="Total Vessels"
          value="128"
          color="blue"
        />

        <StatCard
          title="Active Voyages"
          value="42"
          color="green"
        />

        <StatCard
          title="Safety Alerts"
          value="7"
          color="red"
        />

        <StatCard
          title="Ports Covered"
          value="16"
          color="purple"
        />

      </div>



      {/* Quick Access */}

      <h2 className="text-xl font-bold mb-4">
        Quick Access
      </h2>

      <div className="grid grid-cols-3 gap-6">

        {visibleCards.map((card, index) => (

          <div
            key={index}
            onClick={() => navigate(card.path)}
            className={`
              ${card.color}
              text-white
              p-6
              rounded-xl
              shadow-lg
              cursor-pointer
              hover:scale-105
              transition
            `}
          >

            <div className="mb-3">
              {card.icon}
            </div>

            <h3 className="text-lg font-semibold">
              {card.title}
            </h3>

          </div>

        ))}

      </div>

    </div>

  )

}



/* Stat Card Component */

function StatCard({ title, value, color }) {

  const colorMap = {

    blue: "border-blue-500 text-blue-600",
    green: "border-green-500 text-green-600",
    red: "border-red-500 text-red-600",
    purple: "border-purple-500 text-purple-600"

  }

  return (

    <div className={`
      bg-white
      p-5
      rounded-xl
      shadow
      border-l-4
      ${colorMap[color]}
    `}>

      <p className="text-gray-600">
        {title}
      </p>

      <h2 className="text-2xl font-bold">
        {value}
      </h2>

    </div>

  )

}
