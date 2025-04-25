import { useState } from "react";
import DashboardStats from "./DashboardStats";
import UserList from "./UserList";
import StoreList from "./StoreList";
import AddUserModal from "./AddUserModal";
import AddStoreModal from "./AddStoreModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FiLogOut } from "react-icons/fi";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const { logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          System Administrator Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "dashboard" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "users" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "stores" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("stores")}
        >
          Stores
        </button>
      </div>

      {activeTab === "dashboard" && <DashboardStats />}
      {activeTab === "users" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setShowUserModal(true)}
            >
              Add New User
            </button>
          </div>
          <UserList />
        </>
      )}
      {activeTab === "stores" && (
        <>
          <div className="flex justify-end">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setShowStoreModal(true)}
            >
              Add New Store
            </button>
          </div>
          <StoreList />
        </>
      )}

      {showUserModal && (
        <AddUserModal onClose={() => setShowUserModal(false)} />
      )}
      {showStoreModal && (
        <AddStoreModal onClose={() => setShowStoreModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
