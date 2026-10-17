
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(
      String(user?.role ?? "").replace(/^ROLE_/, "").toUpperCase()
    )
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
