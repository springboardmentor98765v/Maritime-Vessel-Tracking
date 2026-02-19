import React, { useState } from "react"

export default function VoyageHistoryPage() {

  // Dummy voyage history data
  const [voyages] = useState([
    {
      id: 1,
      vessel: "MV Ocean Queen",
      origin: "Mumbai",
      destination: "Dubai",
      departure: "2026-02-10 08:30",
      arrival: "2026-02-14 16:45",
      status: "Completed"
    },
    {
      id: 2,
      vessel: "MT Sea Explorer",
      origin: "Chennai",
      destination: "Singapore",
      departure: "2026-02-12 10:15",
      arrival: "2026-02-18 09:00",
      status: "In Progress"
    },
    {
      id: 3,
      vessel: "MV Global Carrier",
      origin: "Kolkata",
      destination: "Colombo",
      departure: "2026-02-08 14:00",
      arrival: "2026-02-12 20:30",
      status: "Completed"
    },
    {
      id: 4,
      vessel: "MV Arabian Star",
      origin: "Kochi",
      destination: "Doha",
      departure: "2026-02-15 06:00",
      arrival: "2026-02-19 11:30",
      status: "In Progress"
    }
  ])

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-6">
        Voyage History
      </h1>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-blue-600 text-white">

            <tr>
              <th className="p-3 text-left">Vessel</th>
              <th className="p-3 text-left">Origin</th>
              <th className="p-3 text-left">Destination</th>
              <th className="p-3 text-left">Departure</th>
              <th className="p-3 text-left">Arrival</th>
              <th className="p-3 text-left">Status</th>
            </tr>

          </thead>

          <tbody>

            {voyages.map((voyage) => (

              <tr
                key={voyage.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3 font-semibold">
                  {voyage.vessel}
                </td>

                <td className="p-3">
                  {voyage.origin}
                </td>

                <td className="p-3">
                  {voyage.destination}
                </td>

                <td className="p-3">
                  {voyage.departure}
                </td>

                <td className="p-3">
                  {voyage.arrival}
                </td>

                <td className="p-3">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      voyage.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >

                    {voyage.status}

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}
