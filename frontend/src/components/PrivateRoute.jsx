import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
  const { user } = useAuth();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user?.token) {
        setOk(false);
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/user-protect`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setOk(data?.ok && user?.user?.role === "user");
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Admin authentication check failed:", error);
          setOk(false);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [user?.token]);

  if (loading) {
    return <Loading />;
  }
  return ok ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
