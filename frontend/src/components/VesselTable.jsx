

import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { getVessels } from "../api/axios";
import ReplayMap from "./ReplayMap";

export default function VesselTable({ filters, selectedVesselId }) {

  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [subscribed, setSubscribed] = useState([]);
  const [replayVesselId, setReplayVesselId] = useState(null);

  const fetchSubscriptions = async () => {
  try {
    const res = await API.get("/api/notifications/subscriptions/");
    setSubscribed(res.data);
  } catch (err) {
    console.error(err);
  }
};

  // ===============================
  // Fetch vessels
  // ===============================
  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const res = await getVessels();
        setVessels(res.data.results || res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load vessels");
      }
    };

    fetchVessels();
  }, []);

  // ===============================
  // Fetch subscriptions
  // ===============================
  useEffect(() => {
  fetchSubscriptions();
}, []);

  // ===============================
  // Filter vessels
  // ===============================
  const filteredVessels = vessels.filter(v => {

    if (filters.vessel_type && v.vessel_type !== filters.vessel_type)
      return false;

    if (filters.flag &&
      !v.flag.toLowerCase().includes(filters.flag.toLowerCase()))
      return false;

    return true;

  });

  // ===============================
  // Scroll to selected vessel
  // ===============================
  useEffect(() => {

    if (selectedVesselId) {

      const row = document.querySelector(".highlight-row");

      if (row) {
        row.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

    }

  }, [selectedVesselId, filteredVessels]);

  // ===============================
  // Subscribe / Unsubscribe
  // ===============================
  const handleSubscribe = async (vessel) => {
  setSubscribing(vessel.id);

  try {
    const sub = subscribed.find(s => s.vessel === vessel.id);

    // ===== UNSUBSCRIBE =====
    if (sub) {
      await API.delete(`/api/notifications/subscriptions/${sub.id}/`);
      toast.success(`Unsubscribed from ${vessel.name}`);
    }

    // ===== SUBSCRIBE =====
    else {
      await API.post("/api/notifications/subscriptions/", {
        vessel: vessel.id,
      });
      toast.success(`Subscribed to ${vessel.name}`);
    }

    // ✅ refresh latest data
    await fetchSubscriptions();

  } catch (err) {
    console.error(err.response?.data || err);
    toast.error(err.response?.data?.detail || "Action failed");
  }

  setSubscribing(null);
};

  if (loading) return <p>Loading vessels...</p>;

  return (
    <div className="table-section">

      <table className="vessel-table">

        <thead>
          <tr>
            <th>IMO</th>
            <th>Name</th>
            <th>Type</th>
            <th>Flag</th>
            <th>Destination</th>
            <th>Speed</th>
            <th>Action</th>
            
          </tr>
        </thead>

        <tbody>

          {filteredVessels.map(v => {

            const isSubscribed = subscribed.find(s => s.vessel === v.id);

            return (

              <tr
                key={v.id}
                className={
                  selectedVesselId === v.imo_number
                    ? "highlight-row"
                    : ""
                }
              >

                <td>{v.imo_number}</td>
                <td>{v.name}</td>
                <td>{v.vessel_type}</td>
                <td>{v.flag}</td>
                <td>{v.destination}</td>
                <td>{v.speed}</td>

                <td>

                  <button
                    className="subscribe-btn"
                    disabled={subscribing === v.id}
                    onClick={() => handleSubscribe(v)}
                  >

                    {subscribing === v.id
                      ? "Loading..."
                      : isSubscribed
                      ? "Unsubscribe"
                      : "Subscribe"}

                  </button>
                  <button
                    onClick={() =>{ console.log("replay clicked:", v.id);
                      setReplayVesselId(v.id)}}
                    className="replay-btn"
                  >
                    ▶ Replay Voyage
                  </button>
                  

                </td>

              </tr>
              

            );

          })}

        </tbody>

      </table>
      {replayVesselId && (
  <div className="replay-modal">
    <div className="replay-box">

      <button
        className="close-btn"
        onClick={() => setReplayVesselId(null)}
      >
        ✖ Close
      </button>

      <ReplayMap
  vesselId={replayVesselId}
  vesselName={
    vessels.find(v => v.id === replayVesselId)?.name
  }
/>

    </div>
  </div>
)}
      

    </div>
  );
}
