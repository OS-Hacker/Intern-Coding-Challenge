// components/StoreRatingApp.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FiSearch,
  FiStar,
  FiLogOut,
  FiUser,
  FiEdit,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import UpdatePassword from "../components/UpdatePassword";

const StoreRatingApp = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingModal, setRatingModal] = useState({
    show: false,
    storeId: null,
    currentRating: 0,
    userRating: null,
  });
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const { user, logout } = useAuth();

  // Memoized star rendering function
  const renderStars = useCallback(
    (rating, interactive = false, onStarClick = () => {}) => {
      return (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type={interactive ? "button" : "div"}
              onClick={() => interactive && onStarClick(star)}
              className={`${
                interactive
                  ? "cursor-pointer hover:scale-110"
                  : "cursor-default"
              } transition-transform`}
              disabled={!interactive || ratingLoading}
              aria-label={`${star} star`}
            >
              <FiStar
                className={`h-5 w-5 ${
                  star <= Math.round(rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      );
    },
    [ratingLoading]
  );

  // Fetch stores with ratings from backend
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/stores/stores`,
          {
            params: { search: searchTerm },
            headers: { Authorization: `Bearer ${user?.token}` },
            signal: controller.signal,
          }
        );

        if (!isMounted) return;

        const storesWithUserRatings = await Promise.all(
          response.data.map(async (store) => {
            try {
              const userRatingResponse = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/stores/check`,
                {
                  params: { storeId: store._id },
                  headers: { Authorization: `Bearer ${user?.token}` },
                  signal: controller.signal,
                }
              );
              return {
                ...store,
                userRating: userRatingResponse.data.rating || null,
                ratingCount: store.ratingCount || 0,
              };
            } catch (error) {
              if (!axios.isCancel(error)) {
                console.error("Error fetching user rating:", error);
              }
              return {
                ...store,
                userRating: null,
                ratingCount: store.ratingCount || 0,
              };
            }
          })
        );

        if (isMounted) {
          setStores(storesWithUserRatings);
          setFilteredStores(storesWithUserRatings);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching stores:", error);
          toast.error("Failed to load stores");
          if (isMounted) {
            setStores([]);
            setFilteredStores([]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchStores();
    }, 500);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, ratingLoading]);

  const handleRateStore = async () => {
    if (!ratingModal.currentRating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setRatingLoading(true);
      const {
        storeId,
        currentRating,
        userRating: previousUserRating,
      } = ratingModal;

      // Optimistic UI update - show changes immediately
      setStores((prevStores) =>
        prevStores.map((store) => {
          if (store._id === storeId) {
            const wasPreviouslyRated = !!previousUserRating;
            const newRatingCount = wasPreviouslyRated
              ? store.ratingCount
              : store.ratingCount + 1;

            const previousTotalRating =
              parseFloat(store.rating) * store.ratingCount;
            let newTotalRating;

            if (wasPreviouslyRated) {
              newTotalRating =
                previousTotalRating - previousUserRating + currentRating;
            } else {
              newTotalRating = previousTotalRating + currentRating;
            }

            const newAverageRating = (newTotalRating / newRatingCount).toFixed(
              1
            );

            return {
              ...store,
              rating: newAverageRating,
              ratingCount: newRatingCount,
              userRating: currentRating,
            };
          }
          return store;
        })
      );

      // Make the API call
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/stores/ratings`,
        { storeId, rating: currentRating },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      // Update with server response
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === storeId
            ? {
                ...store,
                rating: response.data.rating,
                ratingCount: response.data.ratingCount,
                userRating: currentRating,
              }
            : store
        )
      );

      toast.success("Rating submitted successfully!");
      setRatingModal({
        show: false,
        storeId: null,
        currentRating: 0,
        userRating: null,
      });
    } catch (error) {
      console.error("Error submitting rating:", error);

      // Revert optimistic update
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === ratingModal.storeId
            ? {
                ...store,
                rating: store.rating,
                ratingCount: store.ratingCount,
                userRating: ratingModal.userRating,
              }
            : store
        )
      );

      toast.error(
        error.response?.status === 400
          ? "You have already rated this store"
          : "Failed to submit rating"
      );
    } finally {
      setRatingLoading(false);
    }
  };

  console.log(filteredStores);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <Navbar />
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search stores by name or address..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search stores"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4" aria-label="Loading stores">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white p-6 rounded-lg shadow"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Stores list */}
        {!loading && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {filteredStores.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredStores.map((store) => (
                  <li key={store._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {store.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {store.address}
                        </p>
                        <div className="mt-2 flex items-center">
                          {renderStars(store.rating || 0)}
                          <span className="ml-2 text-sm text-gray-500">
                            ({store.rating || "0.0"}) • {store.ratingCount || 0}{" "}
                            ratings
                          </span>
                        </div>
                        {store.userRating && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="mr-1">Your rating:</span>
                            {renderStars(store.userRating)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() =>
                            setRatingModal({
                              show: true,
                              storeId: store._id,
                              currentRating: store.userRating || 0,
                              userRating: store.userRating,
                            })
                          }
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          aria-label={
                            store.userRating ? "Update rating" : "Rate store"
                          }
                        >
                          {store.userRating ? (
                            <>
                              <FiEdit className="mr-1" /> Update Rating
                            </>
                          ) : (
                            <>
                              <FiStar className="mr-1" /> Rate Store
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No stores found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "There are currently no stores available."}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rating Modal */}
      {ratingModal.show && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <FiStar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {ratingModal.userRating
                      ? "Update Your Rating"
                      : "Rate This Store"}
                  </h3>
                  <div className="mt-4">
                    <div className="flex justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setRatingModal((prev) => ({
                              ...prev,
                              currentRating: star,
                            }))
                          }
                          className="mx-1 focus:outline-none"
                          disabled={ratingLoading}
                          aria-label={`${star} star`}
                        >
                          <FiStar
                            className={`h-10 w-10 transition-colors ${
                              star <= ratingModal.currentRating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {ratingModal.currentRating} star
                      {ratingModal.currentRating !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleRateStore}
                  disabled={!ratingModal.currentRating || ratingLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:col-start-2 sm:text-sm transition-colors ${
                    ratingModal.currentRating && !ratingLoading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {ratingLoading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <FiCheck className="mr-2" /> Submit Rating
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRatingModal({
                      show: false,
                      storeId: null,
                      currentRating: 0,
                      userRating: null,
                    })
                  }
                  disabled={ratingLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <UpdatePassword />
    </div>
  );
};

export default StoreRatingApp;
