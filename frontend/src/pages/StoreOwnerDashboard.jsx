import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import UpdatePassword from "./../components/UpdatePassword";
import axios from "axios";

const StoreOwnerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Extract storeId from user data or URL params
  const ownerId = user?.user?.id; // Assuming storeId is in user object

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        if (!ownerId) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/stores/${ownerId}/ratings`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        console.log(response)

        if (response.data.success) {
          setRatings(response.data.ratings);
          setAverageRating(response.data.averageRating);
        } else {
          setError(response.data.message || "Failed to fetch ratings");
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
        setError(error.response?.data?.message || "Error fetching ratings");
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [ownerId, user?.token]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star rating
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-6 h-6 ${
          star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please login to view this page</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">{user?.user?.name}</h2>
              <div className="flex items-center">
                <div className="text-5xl font-bold mr-4">
                  {averageRating?.toFixed(1) || 0}/5
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    {renderStars(averageRating)}
                  </div>
                  <p className="text-gray-600">
                    Based on {ratings?.length} rating
                    {ratings?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Ratings</h2>
              {ratings?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No ratings submitted yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ratings.map((rating) => (
                        <tr key={rating.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {rating.userName || "Anonymous"}
                            </div>
                            {rating.userEmail && (
                              <div className="text-sm text-gray-500">
                                {rating.userEmail}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {rating.rating}
                              <svg
                                className="w-4 h-4 ml-1 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs break-words">
                              {rating.comment || "No comment provided"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(rating.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <UpdatePassword />
    </>
  );
};

export default StoreOwnerDashboard;
