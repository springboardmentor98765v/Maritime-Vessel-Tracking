import React from "react";
import ArrivalsDepartures from "../components/ports/ArrivalsDepartures";
import CongestionChart from "../components/ports/CongestionChart";

export default function PortAnalyticsPage() {

  const analytics = {
    totalPorts: 12,
    activePorts: 9,
    totalArrivals: 128,
    totalDepartures: 121,
  };

  const weeklyData = [
    { date: "Mon", arrivals: 20, departures: 18 },
    { date: "Tue", arrivals: 25, departures: 22 },
    { date: "Wed", arrivals: 18, departures: 15 },
    { date: "Thu", arrivals: 22, departures: 20 },
    { date: "Fri", arrivals: 30, departures: 28 },
  ];

  const congestionData = [
    { port: "Mumbai", congestionScore: 85 },
    { port: "Chennai", congestionScore: 60 },
    { port: "Kolkata", congestionScore: 45 },
    { port: "Kochi", congestionScore: 30 },
    { port: "Vizag", congestionScore: 20 },
  ];

  return (
    <div className="p-6 bg-slate-100 min-h-screen">

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Port Analytics Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm">Total Ports</h3>
          <p className="text-2xl font-bold text-blue-600">
            {analytics.totalPorts}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm">Active Ports</h3>
          <p className="text-2xl font-bold text-green-600">
            {analytics.activePorts}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm">Total Arrivals</h3>
          <p className="text-2xl font-bold text-purple-600">
            {analytics.totalArrivals}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm">Total Departures</h3>
          <p className="text-2xl font-bold text-red-600">
            {analytics.totalDepartures}
          </p>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ArrivalsDepartures data={weeklyData} />
        <CongestionChart data={congestionData} />
      </div>

    </div>
  );
}
