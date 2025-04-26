import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, logout } = useAuth(); // Add logout function
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // Track current route

  useEffect(() => {
    let isMounted = true; // Cleanup flag
    const cancelToken = axios.CancelToken.source(); // For request cancellation

    const checkAdminAuth = async () => {
      if (!user?.token) {
        if (isMounted) {
          setOk(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/admin-protect`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            cancelToken: cancelToken.token,
          }
        );

        if (isMounted) {
          setOk(!!(data?.ok && user?.user?.role === "admin"));
        }
      } catch (error) {
        if (isMounted && !axios.isCancel(error)) {
          console.error("Admin authentication check failed:", error);

          // Handle specific error cases
          if (error.response?.status === 401) {
            logout(); // Clear invalid credentials
          }

          setOk(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdminAuth();

    return () => {
      isMounted = false;
      cancelToken.cancel("Component unmounted, request canceled");
    };
  }, [user, logout]); // Include all dependencies

  if (loading) {
    return <Loading />;
  }

  // Redirect to login with return location if not authenticated
  return ok ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default AdminRoute;
