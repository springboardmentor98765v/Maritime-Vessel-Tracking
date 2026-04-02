import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"

import { Pause, Play, RotateCcw } from "lucide-react"

import api from "../api/axios"
import VesselReplayMap from "../components/maps/VesselReplayMap"

export default function VesselDetailsPage() {
  const navigate = useNavigate()
  const { vessel_id } = useParams()
  const location = useLocation()

  const backSelectedVesselId = location.state?.selectedVesselId || vessel_id

  const [vessel, setVessel] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [positionsIndex, setPositionsIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showZones, setShowZones] = useState(true)
  const [audit, setAudit] = useState(null)

  const positions = useMemo(() => {
    return (timeline || []).filter((x) => x.type === "position")
  }, [timeline])

  const currentPosition = positions[positionsIndex] || null

  const eventsUpToCurrent = useMemo(() => {
    if (!currentPosition) return []
    const t = currentPosition.time
    return (timeline || [])
      .filter((x) => x.type === "event" && x.time <= t)
      .sort((a, b) => b.time - a.time)
      .slice(0, 8)
  }, [timeline, currentPosition?.time])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError("")
        const [vesselResp, timelineResp] = await Promise.all([
          api.get(`/vessels/${vessel_id}/`),
          api.get(`/voyage/${vessel_id}/history/`),
        ])

        if (!mounted) return

        setVessel(vesselResp.data || null)
        const tl = timelineResp.data || []
        setTimeline(tl)
        setPositionsIndex(0)
        setIsPlaying(false)
      } catch (err) {
        console.error("Failed to load vessel details/replay", err?.response?.data || err.message)
        if (!mounted) return
        setError("Failed to load vessel details")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [vessel_id])

  useEffect(() => {
    const voyageId = positions[0]?.voyage_id
    if (!voyageId) return
    const loadAudit = async () => {
      try {
        const resp = await api.get(`/voyage/${voyageId}/audit/`)
        setAudit(resp.data || null)
      } catch (err) {
        console.error("Failed to load voyage audit", err?.response?.data || err.message)
      }
    }

    loadAudit()
  }, [positions?.length, positions[0]?.voyage_id])

  useEffect(() => {
    if (!isPlaying) return
    if (!positions || positions.length < 2) return

    const interval = setInterval(() => {
      setPositionsIndex((idx) => {
        const next = idx + 1
        if (next >= positions.length) {
          setIsPlaying(false)
          clearInterval(interval)
          return idx
        }
        return next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isPlaying, positions?.length])

  const startReplay = () => {
    if (!positions || positions.length < 2) return
    setPositionsIndex(0)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (!positions || positions.length < 2) return
    if (!isPlaying && positionsIndex >= positions.length - 1) {
      setPositionsIndex(0)
    }
    setIsPlaying((v) => !v)
  }

  const handleBack = () => {
    navigate("/vessels", {
      state: { selectedVesselId: backSelectedVesselId },
    })
  }

  const minTimeLabel = positions[0]?.time
  const maxTimeLabel = positions[positions.length - 1]?.time

  return (
    <div className="page-shell">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="rounded-xl border border-emerald-900/70 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-50 hover:bg-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
          >
            ← Back to vessels
          </button>
          <div>
            <h1 className="page-title">Vessel replay</h1>
            <p className="page-subtitle">
              {vessel?.vessel_name || "Loading…"} timeline replay with safety-zone risk.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-emerald-100/80">Loading replay…</div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-emerald-100/70">Voyage timeline</div>
                    <div className="mt-1 text-lg text-emerald-50 font-semibold">
                      {positions.length ? `${positions.length} replay points` : "No replay data"}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-emerald-100/80">
                    <input
                      type="checkbox"
                      checked={showZones}
                      onChange={(e) => setShowZones(e.target.checked)}
                    />
                    Show zones
                  </label>
                </div>

                <div className="mt-4 p-3 rounded-xl border border-emerald-900/60 bg-emerald-950/30">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{minTimeLabel ? new Date(minTimeLabel).toLocaleString() : "-"}</span>
                    <span>{maxTimeLabel ? new Date(maxTimeLabel).toLocaleString() : "-"}</span>
                  </div>

                  <div className="mt-3">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, positions.length - 1)}
                      value={positionsIndex}
                      onChange={(e) => {
                        setIsPlaying(false)
                        setPositionsIndex(Number(e.target.value))
                      }}
                      className="w-full"
                      disabled={positions.length < 2}
                    />
                    <div className="mt-2 text-sm text-emerald-100/80">
                      {currentPosition?.time ? `Point @ ${new Date(currentPosition.time).toLocaleTimeString()}` : "-"}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={startReplay}
                      disabled={positions.length < 2}
                      className="rounded-xl border border-emerald-900/70 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-50 hover:bg-emerald-900/40 disabled:opacity-50"
                    >
                      <RotateCcw size={16} className="inline-block mr-2" />
                      Replay
                    </button>

                    <button
                      onClick={togglePlay}
                      disabled={positions.length < 2}
                      className="rounded-xl border border-emerald-900/70 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-50 hover:bg-emerald-900/40 disabled:opacity-50"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={16} className="inline-block mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={16} className="inline-block mr-2" />
                          Play
                        </>
                      )}
                    </button>
                  </div>

                  {audit && (
                    <div className="mt-3 text-sm text-slate-200">
                      <div className="text-xs uppercase tracking-wide text-emerald-100/70">
                        Voyage risk flags
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(audit.risk_flags || []).length === 0 ? (
                          <span className="pill border border-emerald-900/60 bg-emerald-950/20 text-emerald-100/90">
                            No flags
                          </span>
                        ) : (
                          (audit.risk_flags || []).map((f) => (
                            <span
                              key={f}
                              className="pill border border-emerald-900/60 bg-emerald-950/20 text-emerald-100/90"
                            >
                              {f}
                            </span>
                          ))
                        )}
                        {audit.delay && (
                          <span className="pill border border-red-900/60 bg-red-950/20 text-red-100/90">
                            Delay detected
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {vessel && (
                  <div className="mt-4 text-sm text-slate-300">
                    <div>
                      <span className="text-emerald-100/70">IMO:</span> {vessel.imo_number || "-"}
                    </div>
                    <div>
                      <span className="text-emerald-100/70">Type:</span> {vessel.vessel_type || "-"}
                    </div>
                    <div>
                      <span className="text-emerald-100/70">Flag:</span> {vessel.flag || "-"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="text-sm font-semibold text-emerald-100 mb-2">Detected events</div>
                {eventsUpToCurrent.length === 0 ? (
                  <div className="text-sm text-slate-400">No events up to this point.</div>
                ) : (
                  <div className="space-y-2">
                    {eventsUpToCurrent.map((e, idx) => (
                      <div
                        key={`${e.type}-${e.time}-${idx}`}
                        className="p-3 rounded-xl border border-emerald-900/40 bg-emerald-950/20"
                      >
                        <div className="text-sm text-slate-100 font-medium">
                          {e.event || e.event_type || e.details || "Event"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {e.time ? new Date(e.time).toLocaleString() : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <VesselReplayMap
              positions={positions}
              currentIndex={positionsIndex}
              showZones={showZones}
              initialView={
                positions[0]
                  ? { center: [positions[0].lat, positions[0].lon], zoom: 6 }
                  : { center: [20.5937, 78.9629], zoom: 5 }
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

