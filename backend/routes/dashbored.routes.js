const express = require("express");
const { authUser, isAdmin } = require("../middleware/auth");
const {
  dashboredController,
  getUsersController,
  createUserController,
  createStoreController,
  getStoreOwnersController,
} = require("../controllers/dashbored.controller");
const dashboredRoutes = express.Router();
const { check } = require("express-validator");
const { getStoresController } = require("../controllers/store.controller");

// DASHBOARD
dashboredRoutes.get("/dashboard", authUser, isAdmin, dashboredController);

dashboredRoutes.get("/users", authUser, isAdmin, getUsersController);

dashboredRoutes.get("/stores", authUser, isAdmin, getStoresController);

dashboredRoutes.post(
  "/users",
  [
    authUser,
    isAdmin,
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("address", "Address is required").not().isEmpty(),
    check("role", "Role is required").isIn(["admin", "user", "store_owner"]),
  ],
  createUserController
);

dashboredRoutes.get(
  "/store-owners",
  authUser,
  isAdmin,
  getStoreOwnersController
);

dashboredRoutes.post(
  "/stores",
  [
    authUser,
    isAdmin,
    check("name", "Store name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("address", "Address is required").not().isEmpty(),
    check("owner", "Owner ID is required").not().isEmpty(),
  ],
  createStoreController
);

module.exports = dashboredRoutes;
