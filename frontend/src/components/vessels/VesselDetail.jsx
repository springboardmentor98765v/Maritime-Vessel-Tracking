export default function VesselDetail({ vessel, onClose }) {

  if (!vessel) return null

  return (

    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "350px",
        height: "100%",
        background: "#0b0f19",
        color: "white",
        padding: "20px",
        boxShadow: "-4px 0 10px rgba(0,0,0,0.5)",
        zIndex: 1000
      }}
    >

      <button onClick={onClose}>
        Close ✖
      </button>

      <h2>{vessel.name}</h2>

      <p>Status: {vessel.status}</p>

      <p>Latitude: {vessel.position[0]}</p>

      <p>Longitude: {vessel.position[1]}</p>

      <p>Speed: {vessel.speed} knots</p>

      <p>Destination: Mumbai Port</p>

    </div>

  )
}
