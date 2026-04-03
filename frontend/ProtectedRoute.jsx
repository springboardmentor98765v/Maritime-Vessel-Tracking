import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // matches exactly what Login.js stores
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;