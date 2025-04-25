import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const AddStoreModal = ({ onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    owner: "",
  });
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/admin/store-owners`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        console.log(res?.data.user)
        setOwners(res?.data?.user);
      } catch (err) {
        toast.error("Failed to fetch store owners.");
        console.log(err)
      }
    };

    fetchOwners();
  }, [user?.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.length < 20 || formData.name.length > 60) {
      toast.error("Store name must be between 20 and 60 characters.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    if (formData.address.length > 400) {
      toast.error("Address must not exceed 400 characters.");
      return;
    }

    if (!formData.owner) {
      toast.error("Please select a store owner.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/admin/stores`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      toast.success("Store added successfully!");
      onClose();
      setFormData({ name: "", email: "", address: "", owner: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add store");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Store
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Store Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Store Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Store Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              ></textarea>
            </div>

            {/* Owner Selection */}
            <div className="mb-6">
              <label
                htmlFor="owner"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Store Owner
              </label>
              <select
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">-- Select Owner --</option>
                {owners?.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                {isLoading ? "Adding..." : "Add Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStoreModal;
