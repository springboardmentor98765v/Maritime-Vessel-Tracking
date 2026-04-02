import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Popup, Circle, CircleMarker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import api from "../../api/axios"

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export default function VesselMap({ initialView, onViewChange, selectedVesselId }) {

  const [vessels, setVessels] = useState([])
  const [loadingVessels, setLoadingVessels] = useState(true)

  const [zones, setZones] = useState([])
  const [showZones, setShowZones] = useState(true)

  const selectedVessel = useMemo(() => {
    if (!selectedVesselId) return null
    return vessels.find((v) => v.id === selectedVesselId) || null
  }, [vessels, selectedVesselId])

  // Fetch vessels from backend (poll every 30s)
  useEffect(() => {
    let mounted = true

    const fetchVessels = async () => {
      try {
        const resp = await api.get("/vessels/")
        if (!mounted) return
        setVessels(resp.data || [])
      } catch (err) {
        console.error("Failed to load vessels", err?.response?.data || err.message)
      } finally {
        if (mounted) setLoadingVessels(false)
      }
    }

    fetchVessels()
    const interval = setInterval(fetchVessels, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // Fetch safety zones from backend
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const resp = await api.get("/vessels/safety/zones/")
        setZones(resp.data || [])
      } catch (err) {
        console.error("Failed to load safety zones", err?.response?.data || err.message)
      }
    }

    fetchZones()
  }, [])

  const getZoneColor = (severity) => {
    if (!severity) return "green"
    const level = severity.toUpperCase()
    if (level === "HIGH" || level === "DANGER") return "red"
    if (level === "MEDIUM") return "yellow"
    if (level === "SAFE") return "green"
    return "green"
  }

  const severityRank = (severity) => {
    if (!severity) return 0
    const s = severity.toUpperCase()
    if (s === "HIGH" || s === "DANGER") return 3
    if (s === "MEDIUM") return 2
    if (s === "SAFE") return 1
    return 0
  }

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(a))
  }

  const zoneByRank = useMemo(() => {
    const sorted = [...zones].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    return sorted
  }, [zones])

  const vesselColor = (v) => {
    const lat = v.latitude
    const lon = v.longitude
    for (const z of zoneByRank) {
      const d = haversineKm(lat, lon, z.latitude, z.longitude)
      if (d <= z.radius_km) {
        return getZoneColor(z.severity)
      }
    }
    return "green"
  }

  return (

    <div className="h-125 w-full rounded-lg shadow">

      <div className="flex items-center gap-4 mb-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showZones}
            onChange={(e) => setShowZones(e.target.checked)}
          />
          <span className="text-emerald-100">Show safety zones</span>
        </label>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" />{" "}
            <span className="text-emerald-100 text-xs">Safe</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />{" "}
            <span className="text-emerald-100 text-xs">Medium</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />{" "}
            <span className="text-emerald-100 text-xs">Danger</span>
          </span>
        </div>
      </div>

      <MapContainer
        center={initialView?.center || [20.5937, 78.9629]}
        zoom={initialView?.zoom || 5}
        className="h-full w-full"
      >
        <MapViewTracker onViewChange={onViewChange} />
        <SelectedVesselController selectedVessel={selectedVessel} />

        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showZones && zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={zone.radius_km * 1000}
            pathOptions={{
              color: getZoneColor(zone.severity),
              fillColor: getZoneColor(zone.severity),
              fillOpacity: 0.25,
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">
                  {zone.name}
                </h3>
                <p>Type: {zone.zone_type}</p>
                <p>Severity: {zone.severity}</p>
                <p>Radius: {zone.radius_km} km</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {!loadingVessels && vessels.map((v) => {
          const color = vesselColor(v)
          const isSelected = selectedVesselId && v.id === selectedVesselId
          const radius = isSelected ? 9 : 4
          return (
            <CircleMarker
              key={v.id}
              center={[v.latitude, v.longitude]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.9,
                weight: isSelected ? 2 : 1,
              }}
            >
              <Popup>
                <div>
                  <h3 className={`font-bold ${isSelected ? "text-emerald-50" : "text-slate-900"}`}>
                    🚢 {v.vessel_name}
                  </h3>
                  <p className="text-sm text-slate-700">IMO: {v.imo_number}</p>
                  <p className="text-sm text-slate-700">Type: {v.vessel_type}</p>
                  <p className="text-sm text-slate-700">Flag: {v.flag || "-"}</p>
                  <p className="text-sm text-slate-700">Speed: {v.speed}</p>
                  <p className="text-sm text-slate-700">Destination: {v.destination || "-"}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

      </MapContainer>

    </div>

  )

}

function MapViewTracker({ onViewChange }) {
  useMapEvents({
    moveend: (e) => {
      if (!onViewChange) return
      const map = e.target
      const c = map.getCenter()
      onViewChange({ center: [c.lat, c.lng], zoom: map.getZoom() })
    },
    zoomend: (e) => {
      if (!onViewChange) return
      const map = e.target
      const c = map.getCenter()
      onViewChange({ center: [c.lat, c.lng], zoom: map.getZoom() })
    },
  })
  return null
}

function SelectedVesselController({ selectedVessel }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedVessel) return
    if (typeof selectedVessel.latitude !== "number" || typeof selectedVessel.longitude !== "number") return

    const zoom = Math.max(map.getZoom(), 8)
    map.setView([selectedVessel.latitude, selectedVessel.longitude], zoom, { animate: true })
  }, [selectedVessel?.id])

  return null
}
