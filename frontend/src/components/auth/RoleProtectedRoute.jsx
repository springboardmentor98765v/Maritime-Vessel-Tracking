import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
