import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

export default function PrivateRoute({ children }) {

  const { isAuthenticated, isLoading } = useSelector(
    state => state.auth
  )

  const token = localStorage.getItem("access_token")

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  // Allow access if token exists OR authenticated
  if (!isAuthenticated && !token) {
    return <Navigate to="/" replace />
  }

  return children
}
