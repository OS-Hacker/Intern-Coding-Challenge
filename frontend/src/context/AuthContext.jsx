import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return null;

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.token || !parsedUser?.user) {
        console.warn("Invalid user data in localStorage");
        return null;
      }

      // Set axios auth header if token exists
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${parsedUser.token}`;
      return parsedUser;
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // Password modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        setLoading,
        logout,
        isAuthenticated: !!user?.token,
        loading,
        passwordModalOpen,
        setPasswordModalOpen,
      }}
    >
      {children} {/* Only render children when not loading */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
