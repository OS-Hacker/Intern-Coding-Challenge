import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Changed from Navigate to useNavigate
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Loading from "../components/Loading";

function RegisterPage() {
  const { setUser, user, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Added useNavigate hook

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    else if (formData.name.length < 20)
      newErrors.name = "Name must be at least 20 characters";
    else if (formData.name.length > 60)
      newErrors.name = "Name must be less than 60 characters";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (formData.password.length > 16)
      newErrors.password = "Password must be less than 16 characters";
    else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter and one special character";
    }

    if (!formData.address) newErrors.address = "Address is required";
    else if (formData.address.length > 400)
      newErrors.address = "Address must be less than 400 characters";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setAuthLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          },
        }
      );

      localStorage.setItem("user", JSON.stringify(data));

      setUser({
        token: data?.token,
        user: data?.user,
      });

      toast.success("Registration successful!");
      navigate("/user/stores"); // Changed from Navigate to navigate
    } catch (error) {
      const message =
        error.response?.data?.msg || "Registration failed. Please try again.";
      toast.error(message);
      console.log(error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  if (authLoading) {
    return <Loading />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-3xl font-semibold text-gray-900">
          Create a New Account
        </h2>

        {error && (
          <div className="mt-4 bg-red-50 p-3 rounded-md text-red-600 text-sm text-center flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={handleChange}
              placeholder="Full Name"
              value={formData.name}
              className={`w-full rounded-md border px-3 py-2 focus:ring-indigo-500 sm:text-sm ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Email Address"
              value={formData.email}
              className={`w-full rounded-md border px-3 py-2 focus:ring-indigo-500 sm:text-sm ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field with React Icons */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                placeholder="Password"
                value={formData.password}
                className={`w-full rounded-md border px-3 py-2 focus:ring-indigo-500 sm:text-sm ${
                  errors.password ? "border-red-300" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-2 text-gray-500 flex items-center"
              >
                {showPassword ? (
                  <AiFillEyeInvisible size={20} />
                ) : (
                  <AiFillEye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Address Field */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              onChange={handleChange}
              placeholder="Address"
              value={formData.address}
              className={`w-full rounded-md border px-3 py-2 focus:ring-indigo-500 sm:text-sm ${
                errors.address ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            // disabled={authLoading || loading} // Added loading to disabled condition
            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 focus:ring-indigo-500 disabled:opacity-50"
          >
            {authLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Redirect */}
        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
