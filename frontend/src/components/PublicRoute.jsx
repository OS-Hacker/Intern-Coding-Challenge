import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { user } = useAuth();

  if (user) {
    // Redirect based on user role
    switch (user?.user?.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "store_owner":
        return <Navigate to="/store-owner/dashboard" replace />;
      default:
        return <Navigate to="/user/stores" replace />;
    }
  }

  // If not logged in, allow access to public routes (login/register)
  return <Outlet />;
};

export default PublicRoute;
