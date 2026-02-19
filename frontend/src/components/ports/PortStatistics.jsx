import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import PortCard from "./PortCard";

export default function PortStatistics() {
  const portData = [
    {
      id: "1",
      name: "Mumbai Port",
      location: "Mumbai, India",
      vessels: 145,
      congestion: "High",
      congestionScore: 80,
    },
    {
      id: "2",
      name: "Chennai Port",
      location: "Chennai, India",
      vessels: 98,
      congestion: "Medium",
      congestionScore: 60,
    },
    {
      id: "3",
      name: "Kolkata Port",
      location: "Kolkata, India",
      vessels: 172,
      congestion: "Low",
      congestionScore: 40,
    },
    {
      id: "4",
      name: "Kochi Port",
      location: "Kochi, India",
      vessels: 76,
      congestion: "Medium",
      congestionScore: 30,
    },
  ];

  const COLORS = ["#3B82F6", "#6366F1", "#8B5CF6", "#14B8A6"];

  const totalPorts = portData.length;
  const totalVessels = portData.reduce((sum, port) => sum + port.vessels, 0);
  const avgCongestion = Math.round(
    portData.reduce((sum, port) => sum + port.congestionScore, 0) /
      totalPorts
  );

  return (
    <div className="p-6 space-y-8 bg-slate-100 min-h-screen">

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        Port Statistics
      </h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-gray-500">Total Ports</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {totalPorts}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-gray-500">Total Active Vessels</p>
          <h2 className="text-3xl font-bold text-indigo-600">
            {totalVessels}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-gray-500">Average Congestion</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {avgCongestion}%
          </h2>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Active Vessels Per Port
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={portData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="vessels"
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Congestion Distribution
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={portData}
              dataKey="congestionScore"
              nameKey="name"
              outerRadius={100}
              label
            >
              {portData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 Port Cards Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Port Overview
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portData.map((port) => (
            <PortCard key={port.id} port={port} />
          ))}
        </div>
      </div>

    </div>
  );
}
