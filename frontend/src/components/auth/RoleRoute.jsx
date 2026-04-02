import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

export default function RoleRoute({ children, allowedRoles }) {
  const { user } = useSelector(state => state.auth)

  // Double check user role vs allowed logic
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
