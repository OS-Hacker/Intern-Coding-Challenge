import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
  const { user, logout } = useAuth(); // Add logout function from context
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if token exists
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
        console.error("Authentication check failed:", error);

        // If token verification failed, clear user data
        if (error.response?.status === 401) {
          logout(); // Clear user from context and local storage
        }

        setOk(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user?.token, logout]); // Add logout to dependencies

  if (loading) {
    return <Loading />;
  }

  return ok ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
