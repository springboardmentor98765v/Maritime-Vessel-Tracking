import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Ship, Activity } from "lucide-react";

export default function PortCard({ port }) {
  const navigate = useNavigate();

  const getCongestionColor = (level) => {
    if (level === "High") return "bg-red-500";
    if (level === "Medium") return "bg-yellow-400 text-black";
    if (level === "Low") return "bg-green-500";
    return "bg-gray-400";
  };

  if (!port) return null;

  return (
    <div
      onClick={() => navigate(`/ports/${port.id}`)}
      className="cursor-pointer bg-white shadow-md rounded-2xl p-6 
                 hover:shadow-2xl hover:-translate-y-1 
                 transition-all duration-300 border border-gray-200"
    >
      {/* Port Name */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="text-blue-600" size={22} />
        <h2 className="text-xl font-semibold text-gray-800">
          {port.name || "Unknown Port"}
        </h2>
      </div>

      {/* Location */}
      <p className="text-gray-500 text-sm mb-4">
        📍 {port.location || "Location not available"}
      </p>

      {/* Vessel Count */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Ship className="text-indigo-600" size={20} />
          <span className="text-gray-700">Active Vessels</span>
        </div>
        <span className="font-bold text-gray-900">
          {port.vessels ?? 0}
        </span>
      </div>

      {/* Congestion */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-purple-600" size={20} />
          <span className="text-gray-700">Congestion</span>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getCongestionColor(
            port.congestion
          )}`}
        >
          {port.congestion || "Unknown"}
        </span>
      </div>
    </div>
  );
}
