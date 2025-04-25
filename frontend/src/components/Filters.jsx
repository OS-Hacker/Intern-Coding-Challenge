import { useState } from "react";
import { debounce } from "lodash";

const Filters = ({ filters, setFilters, type }) => {
  const handleInputChange = debounce((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, 300);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          defaultValue={filters.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Search by name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          defaultValue={filters.email}
          placeholder="Search by email"
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          defaultValue={filters.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Search by address"
        />
      </div>

      {type === "user" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            defaultValue={filters.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
          >
            <option value="">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>
      )}

      <div>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
          onClick={() =>
            setFilters({ name: "", email: "", address: "", role: "" })
          }
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;
