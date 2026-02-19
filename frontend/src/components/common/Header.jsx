import { useDispatch } from "react-redux"
import { logout } from "../../stores/slices/authSlice"
import { useNavigate } from "react-router-dom"

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-800">
        Maritime Admin Panel
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        Logout
      </button>
    </header>
  )
}
