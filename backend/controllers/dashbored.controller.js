const Rating = require("../models/rating.model");
const Store = require("../models/store.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");

const dashboredController = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalRatings = await Rating.countDocuments();

    res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getUsersController = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    let query = {};

    if (name) query.name = new RegExp(name, "i");
    if (email) query.email = new RegExp(email, "i");
    if (address) query.address = new RegExp(address, "i");
    if (role) query.role = role;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 }); // Sort by newest first;

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, address, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      address,
      role,
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// All store-owners

const getStoreOwnersController = async (req, res) => {
  try {
    let user = await User.find({ role: "store_owner" }).sort({ createdAt: -1 }); // Sort by newest first;
    res.json({
      user,
      message: "store_owner get successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const createStoreController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }

  const { name, email, address, owner } = req.body;

  try {
    // Verify requesting user is admin
    const requestingUser = await User.findById(req.user.user.id);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Only admins can create stores",
      });
    }

    // Validate owner exists and is a store owner
    const ownerUser = await User.findOne({
      _id: owner,
      role: "store_owner",
    });

    if (!ownerUser) {
      return res.status(404).json({
        success: false,
        message: "Owner not found or not a store owner",
      });
    }

    // Check if owner already has a store
    if (ownerUser.store) {
      return res.status(400).json({
        success: false,
        message: "This owner already has a store assigned",
      });
    }

    // Check for existing store with same email (case-insensitive)
    const existingStore = await Store.findOne({
      email: email.toLowerCase(),
    });
    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "Store with this email already exists",
        field: "email",
      });
    }

    // Create new store
    const store = new Store({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      owner,
      createdBy: req.user.id,
    });

    await store.save();

    try {
      // Then update the owner with the new store reference
      await User.findByIdAndUpdate(owner, { $set: { store: store._id } });

      // Return success response with store data
      res.status(201).json({
        success: true,
        message: "Store created successfully",
        data: {
          store: {
            id: store._id,
            name: store.name,
            email: store.email,
            address: store.address,
            owner: {
              id: ownerUser._id,
              name: ownerUser.name,
              email: ownerUser.email,
            },
            createdAt: store.createdAt,
          },
        },
      });
    } catch (transactionError) {
      throw transactionError;
    }
  } catch (err) {
    console.error("Error in createStoreController:", err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Store with this email already exists",
        field: "email",
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Server error during store creation",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getStoresController = async (req, res) => {
  try {
    const { name, email, address } = req.query;
    let query = {};

    if (name) query.name = new RegExp(name, "i");
    if (email) query.email = new RegExp(email, "i");
    if (address) query.address = new RegExp(address, "i");

    const stores = await Store.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 }); // Sort by newest first;

    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ store: store._id });
        const avgRating =
          ratings.reduce((acc, curr) => acc + curr.rating, 0) /
            ratings.length || 0;
        return {
          ...store.toObject(),
          rating: avgRating.toFixed(1),
        };
      })
    );

    res.json(storesWithRatings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  dashboredController,
  getUsersController,
  getStoreOwnersController,
  getStoresController,
  createUserController,
  createStoreController,
};
