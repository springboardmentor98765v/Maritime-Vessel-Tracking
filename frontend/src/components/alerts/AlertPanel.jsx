import { useEffect, useState } from "react"
import { connectSocket } from "../../services/websocketService"

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const socket = connectSocket()

    socket.on("vessel_update", (data) => {
      const newAlerts = data.map((v) => ({
        id: v.id,
        message: `${v.name} is ${v.status}`,
      }))
      setAlerts(newAlerts)
    })

    return () => socket.disconnect()
  }, [])

  return (
    <div className="bg-white p-4 shadow-lg rounded-xl h-150 overflow-y-auto">
      <h3 className="font-bold mb-4 text-lg">Live Alerts</h3>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-blue-100 p-2 mb-2 rounded"
        >
          {alert.message}
        </div>
      ))}
    </div>
  )
}
