import React, { useMemo, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../api/axios"
import VesselList from "../components/vessels/VesselList"
import { Search, Ship } from "lucide-react"

export default function VesselsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state || {}
  const initialSelectedVesselId = state?.selectedVesselId || null

  const [vessels, setVessels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [selectedVesselId, setSelectedVesselId] = useState(initialSelectedVesselId)

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await api.get("/vessels/")
        setVessels(response.data)
      } catch (err) {
        console.error("Failed to fetch vessels", err?.response?.data || err.message)
        setError("Failed to fetch vessels")
      } finally {
        setLoading(false)
      }
    }

    fetchVessels()
  }, [])

  const vesselRows = useMemo(
    () =>
      vessels.map((v) => ({
        id: v.id,
        imo: v.imo_number,
        name: v.vessel_name,
        type: v.vessel_type,
        flag: v.flag,
      })),
    [vessels],
  )

  const typeOptions = useMemo(() => {
    const set = new Set(vesselRows.map((v) => v.type).filter(Boolean))
    return ["ALL", ...Array.from(set).sort()]
  }, [vesselRows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return vesselRows.filter((v) => {
      const matchesType = typeFilter === "ALL" || v.type === typeFilter
      const matchesQuery =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.imo?.toLowerCase().includes(q) ||
        v.flag?.toLowerCase().includes(q)
      return matchesType && matchesQuery
    })
  }, [vesselRows, query, typeFilter])

  const handleSelectVessel = (v) => {
    setSelectedVesselId(v.id)
    navigate(`/vessels/${v.id}`, {
      state: {
        selectedVesselId: v.id,
      },
    })
  }

  return (
    <div className="page-shell">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Vessels</h1>
          <p className="page-subtitle">
            Search, filter, and review vessel metadata from the tracking engine.
          </p>
        </div>
        <span className="pill">
          <Ship size={14} />
          {vesselRows.length} total
        </span>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, IMO, or flag…"
                  className="w-full rounded-xl border border-emerald-900/70 bg-emerald-950/70 px-9 py-2.5 text-sm text-emerald-50 placeholder:text-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
                />
              </div>
            </div>

            <div className="md:w-56">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-emerald-900/70 bg-emerald-950/70 px-3 py-2.5 text-sm text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t === "ALL" ? "All vessel types" : t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="text-sm text-emerald-100/80">Loading vessels…</div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-400">{error}</div>
          )}
          {!loading && !error && (
            <VesselList
              vessels={filtered}
              selectedVesselId={selectedVesselId}
              onSelectVessel={handleSelectVessel}
            />
          )}
        </div>
      </div>
    </div>
  )
}