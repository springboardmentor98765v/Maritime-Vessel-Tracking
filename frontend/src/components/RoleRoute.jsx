import { Navigate } from "react-router-dom";

const RoleRoute = ({ children, role }) => {
  const userRole = localStorage.getItem("role");

  // Not logged in
  if (!userRole) {
    return <Navigate to="/" />;
  }

  // Wrong role → redirect to their dashboard
  if (userRole !== role) {
    return <Navigate to={`/${userRole}`} />;
  }

  return children;
};

export default RoleRoute;