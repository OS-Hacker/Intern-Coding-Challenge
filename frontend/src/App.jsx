import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  replace,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Components
import PrivateRoute from "./components/PrivateRoute";
import StoreOwnerRoute from "./components/StoreOwnerRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import UserStoresPage from "./pages/UserStoresPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFoundPage from "./pages/NotFoundPage";
import AdminDashboard from "./components/AdminDashboard";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes (only accessible if not logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Regular user routes */}
          <Route path="/user" element={<PrivateRoute />}>
            <Route path="stores" element={<UserStoresPage />} />
          </Route>

          {/* Store owner routes */}
          <Route path="/store-owner" element={<StoreOwnerRoute />}>
            <Route path="dashboard" element={<StoreOwnerDashboard />} />
          </Route>

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <ToastContainer position="top-center" />
    </Router>
  );
}

export default App;
