// components/StoreOwnerRoute.js
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StoreOwnerRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.user?.role !== "store_owner") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default StoreOwnerRoute;
