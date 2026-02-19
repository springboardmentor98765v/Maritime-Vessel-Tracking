import React, { useState } from "react"
import {
  FileText,
  Download,
  Calendar,
  Ship
} from "lucide-react"

export default function ReportPage() {

  // Dummy report data (Milestone-1)
  const [reports] = useState([
    {
      id: 1,
      name: "Daily Vessel Report",
      type: "Daily",
      date: "2026-02-16",
      vessels: 128,
      status: "Generated"
    },
    {
      id: 2,
      name: "Port Traffic Report",
      type: "Weekly",
      date: "2026-02-14",
      vessels: 342,
      status: "Generated"
    },
    {
      id: 3,
      name: "Voyage History Report",
      type: "Monthly",
      date: "2026-02-01",
      vessels: 892,
      status: "Pending"
    }
  ])

  const handleDownload = (reportName) => {
    alert(`Downloading ${reportName}...`)
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen">

      {/* Heading */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-800">
          Reports
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Reports</p>
          <p className="text-2xl font-bold text-blue-600">
            {reports.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Generated</p>
          <p className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === "Generated").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {reports.filter(r => r.status === "Pending").length}
          </p>
        </div>

      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Available Reports
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Report Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Vessels</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>

              {reports.map(report => (

                <tr
                  key={report.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3 flex items-center gap-2">
                    <Ship size={16} />
                    {report.name}
                  </td>

                  <td className="p-3">
                    {report.type}
                  </td>

                  <td className="p-3 flex items-center gap-2">
                    <Calendar size={16} />
                    {report.date}
                  </td>

                  <td className="p-3">
                    {report.vessels}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${report.status === "Generated"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="p-3">

                    <button
                      onClick={() =>
                        handleDownload(report.name)
                      }
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Download size={16} />
                      Download
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}
