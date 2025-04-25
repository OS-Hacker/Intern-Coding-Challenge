const express = require("express");
const {
  getStoresController,
  ratingController,
  checkUserRatingController,
  getStoreRatings,
} = require("../controllers/store.controller");
const { authUser } = require("../middleware/auth");

const storeRoutes = express.Router();

storeRoutes.get("/stores", authUser, getStoresController);

storeRoutes.post("/ratings", authUser, ratingController);

storeRoutes.get("/check", authUser, checkUserRatingController);

// Get all ratings for a specific store with user details
storeRoutes.get("/:ownerId/ratings", authUser, getStoreRatings);

module.exports = storeRoutes;
