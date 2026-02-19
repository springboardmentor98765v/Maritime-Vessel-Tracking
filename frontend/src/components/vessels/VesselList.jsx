import React from "react";

export default function VesselList({ vessels }) {
  if (!vessels.length) return <p>No vessels found.</p>;

  return (
    <ul className="space-y-2">
      {vessels.map((vessel) => (
        <li key={vessel.imo} className="p-2 border rounded hover:bg-gray-200 cursor-pointer">
          <strong>{vessel.name}</strong> - {vessel.type} ({vessel.flag})
        </li>
      ))}
    </ul>
  );
}
