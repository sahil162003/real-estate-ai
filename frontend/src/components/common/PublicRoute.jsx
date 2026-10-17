import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (role === "ADMIN") {
      return <Navigate to="/admin/applications" replace />;
    }

    if (role === "AGENT") {
      return <Navigate to="/agent/properties" replace />;
    }

    if (role === "CUSTOMER") {
      return <Navigate to="/customer/search" replace />;
    }
  }

  return children;
}
