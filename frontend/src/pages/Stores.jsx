import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaStar, FaSearch } from "react-icons/fa";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/stores", {
          params: { search: searchTerm },
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        // Fetch user ratings for each store
        const storesWithUserRatings = await Promise.all(
          data.map(async (store) => {
            try {
              const ratingResponse = await axios.get(
                `/api/stores/${store._id}/rating`,
                {
                  headers: { Authorization: `Bearer ${user?.token}` },
                }
              );
              return {
                ...store,
                userRating: ratingResponse.data.rating || null,
              };
            } catch (error) {
              return { ...store, userRating: null };
            }
          })
        );

        setStores(storesWithUserRatings);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchStores();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, user?.token]);

  const handleRateStore = async (storeId, rating) => {
    try {
      setRatingLoading(true);

      // Optimistic UI update
      setStores((prevStores) =>
        prevStores.map((store) => {
          if (store._id === storeId) {
            const wasRated = !!store.userRating;
            const newRatingCount = wasRated
              ? store.ratingCount
              : store.ratingCount + 1;
            const newTotalRating = wasRated
              ? store.rating * store.ratingCount - store.userRating + rating
              : (store.rating || 0) * store.ratingCount + rating;

            return {
              ...store,
              rating: newTotalRating / newRatingCount,
              ratingCount: newRatingCount,
              userRating: rating,
            };
          }
          return store;
        })
      );

      // API call
      await axios.post(
        "/api/stores/rate",
        { storeId, rating },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
    } catch (error) {
      console.error("Error rating store:", error);
      // Revert optimistic update on error
      setStores((prevStores) => [...prevStores]);
    } finally {
      setRatingLoading(false);
    }
  };

  const renderStars = (rating, interactive = false, onClick = () => {}) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "div"}
            onClick={() => interactive && onClick(star)}
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
            disabled={!interactive || ratingLoading}
            aria-label={`${star} star`}
          >
            <FaStar
              className={`h-5 w-5 ${
                star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">Stores</h1>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search stores by name or address"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg p-4 h-24"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {stores.length > 0 ? (
            stores.map((store) => (
              <div
                key={store._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {store.name}
                    </h3>
                    <p className="text-gray-600">{store.address}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500 font-bold mr-1">
                      {store.rating?.toFixed(1) || "N/A"}
                    </span>
                    {renderStars(store.rating || 0)}
                    <span className="text-gray-500 text-sm ml-1">
                      ({store.ratingCount || 0})
                    </span>
                  </div>
                </div>

                {user?.role === "user" && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-1">
                      {store.userRating ? "Your rating:" : "Rate this store:"}
                    </p>
                    {store.userRating && (
                      <div className="mb-1">
                        {renderStars(store.userRating)}
                      </div>
                    )}
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateStore(store._id, star)}
                          className={`${
                            star <= (store.userRating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          } hover:text-yellow-400 transition-colors`}
                          disabled={ratingLoading}
                        >
                          <FaStar className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No stores found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search"
                  : "There are currently no stores available"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Stores;
