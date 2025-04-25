import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user } = useAuth();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      if (!user?.token) {
        setOk(false);
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/admin-protect`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        // Only update state if component is still mounted
        setOk(data?.ok && user?.user?.role === "admin");
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Admin authentication check failed:", error);
          setOk(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [user?.token]); // Depend on the whole user object instead of just token

  if (loading) {
    return <Loading />;
  }

  return ok ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
