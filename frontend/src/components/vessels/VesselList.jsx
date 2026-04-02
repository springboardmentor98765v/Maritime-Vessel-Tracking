import React from "react"

export default function VesselList({ vessels, selectedVesselId, onSelectVessel }) {
  if (!vessels.length) {
    return (
      <div className="text-sm text-emerald-100/80">
        No vessels match your filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-emerald-900/60 text-xs uppercase tracking-wide text-emerald-200/80">
            <th className="py-3 pr-4">Vessel</th>
            <th className="py-3 pr-4">IMO</th>
            <th className="py-3 pr-4">Type</th>
            <th className="py-3 pr-4">Flag</th>
          </tr>
        </thead>
        <tbody>
          {vessels.map((vessel) => (
            <tr
              key={vessel.imo}
              className={[
                "border-b border-emerald-950/60 hover:bg-emerald-950/70 transition cursor-pointer",
                selectedVesselId && vessel.id === selectedVesselId
                  ? "outline outline-2 outline-emerald-500/60"
                  : "",
              ].join(" ")}
              onClick={() => onSelectVessel && onSelectVessel(vessel)}
            >
              <td className="py-3 pr-4">
                <div className="font-medium text-emerald-50">
                  {vessel.name}
                </div>
              </td>
              <td className="py-3 pr-4 font-mono text-sm text-emerald-100/90">
                {vessel.imo}
              </td>
              <td className="py-3 pr-4 text-sm text-emerald-100/90">
                {vessel.type || "-"}
              </td>
              <td className="py-3 pr-4 text-sm text-emerald-100/90">
                {vessel.flag || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
