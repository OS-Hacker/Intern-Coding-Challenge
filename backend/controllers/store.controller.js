const Store = require("../models/store.model");
const Rating = require("../models/rating.model");
const { default: mongoose } = require("mongoose");
const User = require("../models/user.model");

const getStoresController = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user?.user?.id; // Get user ID if logged in
    let query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { address: new RegExp(search, "i") }, // Changed from email to address
      ];
    }

    const stores = await Store.find(query)
      .populate("owner", "name email address")
      .sort({ createdAt: -1 }); // Sort by newest first

    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ store: store._id });
        const avgRating =
          ratings.reduce((acc, curr) => acc + curr.rating, 0) /
            ratings.length || 0;

        // Check if user has rated this store
        let userRating = null;
        if (userId) {
          const userRatingDoc = await Rating.findOne({
            store: store._id,
            user: userId,
          });
          userRating = userRatingDoc?.rating || null;
        }

        return {
          _id: store._id,
          name: store.name,
          email: store.email,
          address: store.address, // Ensure address is included
          owner: store.owner,
          rating: avgRating.toFixed(1),
          ratingCount: ratings.length,
          userRating, // Include user's rating if exists
        };
      })
    );

    res.json(storesWithRatings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const ratingController = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    const userId = req.user.user.id;

    // Check if rating exists
    let existingRating = await Rating.findOne({ store: storeId, user: userId });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      existingRating = new Rating({
        store: storeId,
        user: userId,
        rating,
      });
      await existingRating.save();
    }

    // Calculate new average rating
    const ratings = await Rating.find({ store: storeId });
    const avgRating =
      ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length || 0;

    res.json({
      rating: avgRating.toFixed(1),
      ratingCount: ratings.length,
      userRating: rating,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Check if user has rated a specific store
const checkUserRatingController = async (req, res) => {
  try {
    const { storeId } = req.query;
    const userId = req.user.user.id; // From auth middleware

    // Validate storeId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ msg: "Invalid store ID" });
    }

    // Check for existing rating
    const existingRating = await Rating.findOne({
      store: storeId,
      user: userId,
    });

    if (existingRating) {
      return res.json({
        rating: existingRating.rating,
        createdAt: existingRating.createdAt,
      });
    }

    // No rating found
    return res.json({ rating: null });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getStoreRatings = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Validate ownerId format
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner ID format",
      });
    }

    // Get store ID from owner profile
    const owner = await User.findById(ownerId).select("store role").lean();

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    // Verify the user is a store owner
    if (owner.role !== "store_owner") {
      return res.status(403).json({
        success: false,
        message: "Specified user is not a store owner",
      });
    }

    if (!owner.store) {
      return res.status(404).json({
        success: false,
        message: "No store associated with this owner",
      });
    }

    const storeId = owner.store;

    console.log(storeId);

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Rest of your ratings logic...
    const ratings = await Rating.find({ store: storeId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = (sumRatings / totalRatings).toFixed(1);

    // Format response data
    const formattedRatings = ratings.map((rating) => ({
      id: rating._id,
      userName: rating.user?.name || "Anonymous",
      userEmail: rating.user?.email,
      rating: rating.rating,
      createdAt: rating.createdAt,
    }));

    res.status(200).json({
      success: true,
      ratings: formattedRatings,
      averageRating: parseFloat(averageRating),
      totalRatings,
    });
  } catch (error) {
    console.error("Error fetching store ratings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching ratings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getStoresController,
  ratingController,
  checkUserRatingController,
  getStoreRatings,
};
