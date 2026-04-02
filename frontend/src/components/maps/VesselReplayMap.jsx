import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Circle, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import api from "../../api/axios"

delete L.Icon.Default.prototype._getIconUrl

function ReplayerController({ position }) {
  const map = useMap()

  useEffect(() => {
    if (!position) return
    const lat = Number(position.lat)
    const lon = Number(position.lon)
    if (isNaN(lat) || isNaN(lon)) return
    map.setView([lat, lon], Math.max(map.getZoom(), 6), { animate: true })
  }, [position?.lat, position?.lon])

  return null
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export default function VesselReplayMap({
  positions = [],
  currentIndex = 0,
  showZones = true,
  initialView = { center: [20.5937, 78.9629], zoom: 5 },
}) {
  const [zones, setZones] = useState([])

  useEffect(() => {
    let mounted = true
    const fetchZones = async () => {
      try {
        const resp = await api.get("/vessels/safety/zones/")
        if (!mounted) return
        setZones(resp.data || [])
      } catch (err) {
        console.error("Failed to load safety zones", err?.response?.data || err.message)
      }
    }

    fetchZones()
    return () => {
      mounted = false
    }
  }, [])

  const severityRank = (severity) => {
    if (!severity) return 0
    const s = severity.toUpperCase()
    if (s === "HIGH" || s === "DANGER") return 3
    if (s === "MEDIUM") return 2
    if (s === "SAFE") return 1
    return 0
  }

  const getZoneColor = (severity) => {
    if (!severity) return "green"
    const level = severity.toUpperCase()
    if (level === "HIGH" || level === "DANGER") return "red"
    if (level === "MEDIUM") return "yellow"
    if (level === "SAFE") return "green"
    return "green"
  }

  const zoneByRank = useMemo(() => {
    return [...zones].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
  }, [zones])

  const current = positions[currentIndex] || null

  const currentZoneColor = useMemo(() => {
    if (!current) return "green"
    const lat = Number(current.lat)
    const lon = Number(current.lon)

    for (const z of zoneByRank) {
      const d = haversineKm(lat, lon, Number(z.latitude), Number(z.longitude))
      if (d <= Number(z.radius_km)) return getZoneColor(z.severity)
    }
    return "green"
  }, [current?.lat, current?.lon, zoneByRank])

  const path = useMemo(() => {
    const limit = Math.max(0, Math.min(currentIndex, positions.length - 1))
    return positions.slice(0, limit + 1).map((p) => [Number(p.lat), Number(p.lon)])
  }, [positions, currentIndex])

  return (
    <div className="h-[70vh] w-full rounded-xl border border-emerald-900/40 overflow-hidden shadow">
      <MapContainer
        center={initialView?.center || [20.5937, 78.9629]}
        zoom={initialView?.zoom || 5}
        className="h-full w-full"
      >
        <ReplayerController position={current} />

        <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {showZones &&
          zones.map((zone) => (
            <Circle
              key={zone.id}
              center={[Number(zone.latitude), Number(zone.longitude)]}
              radius={Number(zone.radius_km) * 1000}
              pathOptions={{
                color: getZoneColor(zone.severity),
                fillColor: getZoneColor(zone.severity),
                fillOpacity: 0.2,
              }}
            />
          ))}

        {path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{ color: "rgba(16,185,129,0.85)", weight: 3, opacity: 0.9 }}
          />
        )}

        {current && (
          <Marker
            position={[Number(current.lat), Number(current.lon)]}
            icon={L.divIcon({
              className: "ship-smooth-transition flex items-center justify-center",
              html: `<div style="background-color: ${currentZoneColor}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.7); box-shadow: 0 0 8px ${currentZoneColor};"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            })}
          />
        )}
      </MapContainer>
    </div>
  )
}

