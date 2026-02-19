import React from "react";
import { useParams } from "react-router-dom";
import { MapPin, Ship, Activity, Anchor } from "lucide-react";

export default function PortDetail() {
  const { id } = useParams();

  // Same data as PortStatistics (must match IDs)
  const ports = [
    {
      id: "1",
      name: "Mumbai Port",
      location: "Mumbai, India",
      vessels: 145,
      congestion: "High",
      description:
        "Mumbai Port is one of India's busiest ports handling major cargo and container traffic.",
    },
    {
      id: "2",
      name: "Chennai Port",
      location: "Chennai, India",
      vessels: 98,
      congestion: "Medium",
      description:
        "Chennai Port plays a key role in automobile exports and container shipments.",
    },
    {
      id: "3",
      name: "Kolkata Port",
      location: "Kolkata, India",
      vessels: 172,
      congestion: "Low",
      description:
        "Kolkata Port serves eastern India with diverse cargo operations.",
    },
    {
      id: "4",
      name: "Kochi Port",
      location: "Kochi, India",
      vessels: 76,
      congestion: "Medium",
      description:
        "Kochi Port is strategically located and supports maritime trade in southern India.",
    },
  ];

  const port = ports.find((p) => p.id === id);

  if (!port) {
    return (
      <div className="p-10 text-center text-red-500 text-2xl">
        Port Not Found
      </div>
    );
  }

  const getCongestionColor = (level) => {
    if (level === "High") return "bg-red-500";
    if (level === "Medium") return "bg-yellow-400 text-black";
    return "bg-green-500";
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">

      <div className="bg-white rounded-2xl shadow-xl p-8">

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <Anchor className="text-blue-600" size={28} />
          <h1 className="text-3xl font-bold text-gray-800">
            {port.name}
          </h1>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin size={20} />
          <span>{port.location}</span>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-8">
          {port.description}
        </p>

        {/* Stats Section */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Active Vessels */}
          <div className="bg-slate-50 p-6 rounded-xl shadow">
            <div className="flex items-center gap-2 mb-2">
              <Ship className="text-indigo-600" size={22} />
              <h3 className="text-lg font-semibold">
                Active Vessels
              </h3>
            </div>
            <p className="text-3xl font-bold">
              {port.vessels}
            </p>
          </div>

          {/* Congestion */}
          <div className="bg-slate-50 p-6 rounded-xl shadow">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-purple-600" size={22} />
              <h3 className="text-lg font-semibold">
                Congestion Level
              </h3>
            </div>

            <span
              className={`px-4 py-2 rounded-full font-semibold text-white ${getCongestionColor(
                port.congestion
              )}`}
            >
              {port.congestion}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
