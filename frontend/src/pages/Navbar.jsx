import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, setPasswordModalOpen } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };
  return (
    <>
      {/* Header with user dropdown */}
      <div className="flex justify-between items-center mt-4 mx-5 pb-3">
        <h1 className="text-3xl font-bold text-gray-800">
          {user?.user?.role === "user"
            ? "Store Directory"
            : "Store Owner Dashboard"}
        </h1>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FiUser className="text-gray-600" />
            <span className="text-gray-700">
              {user?.user?.name.split(" ")[0]}
            </span>
            <FiChevronDown
              className={`text-gray-600 transition-transform ${
                dropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button
                onClick={() => {
                  setPasswordModalOpen(true);
                  setDropdownOpen(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FiSettings className="mr-2" />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
