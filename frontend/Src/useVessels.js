import { useState, useEffect, useCallback } from "react";

const MOCK_VESSELS = [
  {
    id: 1,
    imo_number: "IMO1234567",
    name: "MSC LUNA",
    vessel_type: "Container",
    flag: "India",
    cargo_type: "General Cargo",
    speed: 18.5,
    heading: 270,
    destination: "Mumbai",
    last_update: new Date().toISOString(),
    last_position_lat: 19.076,
    last_position_lon: 72.877,
  },
  {
    id: 2,
    imo_number: "IMO7654321",
    name: "OCEAN KING",
    vessel_type: "Tanker",
    flag: "China",
    cargo_type: "Oil",
    speed: 12.0,
    heading: 90,
    destination: "Chennai",
    last_update: new Date().toISOString(),
    last_position_lat: 13.08,
    last_position_lon: 80.27,
  },
  {
    id: 3,
    imo_number: "IMO1122334",
    name: "STAR VOYAGER",
    vessel_type: "Cargo",
    flag: "India",
    cargo_type: "Bulk",
    speed: 9.0,
    heading: 180,
    destination: "Kolkata",
    last_update: new Date().toISOString(),
    last_position_lat: 22.57,
    last_position_lon: 88.36,
  },
  {
    id: 4,
    imo_number: "IMO9988776",
    name: "PACIFIC DAWN",
    vessel_type: "Bulk Carrier",
    flag: "Panama",
    cargo_type: "Coal",
    speed: 14.2,
    heading: 45,
    destination: "Vizag",
    last_update: new Date().toISOString(),
    last_position_lat: 17.68,
    last_position_lon: 83.21,
  },
];

const useVessels = (filters = {}) => {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { vessel_type, flag, cargo_type, destination } = filters;

  const loadVessels = useCallback(() => {
    setLoading(true);
    console.log("🔄 Fetching vessels at:", new Date().toLocaleTimeString());

    // ── DEBUG: log exactly what filter value is received ──
    console.log("📌 Filter received → vessel_type:", `"${vessel_type}"`);
    console.log("📌 All MOCK vessel types:", MOCK_VESSELS.map(v => `"${v.vessel_type}"`));

    try {
      let filtered = [...MOCK_VESSELS];

      if (vessel_type && vessel_type !== "") {
        console.log("🔍 Filtering by vessel_type:", vessel_type);
        filtered = filtered.filter((v) => {
          const match = v.vessel_type.trim().toLowerCase() === vessel_type.trim().toLowerCase();
          console.log(`   Comparing "${v.vessel_type}" === "${vessel_type}" → ${match}`);
          return match;
        });
      }

      if (flag && flag !== "") {
        filtered = filtered.filter((v) =>
          v.flag.trim().toLowerCase().includes(flag.trim().toLowerCase())
        );
      }

      if (cargo_type && cargo_type !== "") {
        filtered = filtered.filter((v) =>
          v.cargo_type.trim().toLowerCase().includes(cargo_type.trim().toLowerCase())
        );
      }

      if (destination && destination !== "") {
        filtered = filtered.filter((v) =>
          v.destination.trim().toLowerCase().includes(destination.trim().toLowerCase())
        );
      }

      console.log("✅ Final filtered vessels:", filtered.length, "→", filtered.map(v => v.name));
      setVessels(filtered);
      setError(null);
    } catch (err) {
      setError("Failed to fetch vessels.");
      console.error("❌ Filter error:", err);
    } finally {
      setLoading(false);
    }
  }, [vessel_type, flag, cargo_type, destination]);

  useEffect(() => {
    loadVessels();
    const interval = setInterval(loadVessels, 30000);
    return () => {
      clearInterval(interval);
      console.log("🛑 Auto-refresh stopped");
    };
  }, [loadVessels]);

  return { vessels, loading, error, refetch: loadVessels };
};

export default useVessels;