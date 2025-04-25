const express = require("express");
const { check } = require("express-validator");
const {
  registerController,
  updatePasswordController,
  loginController,
  protectUserController,
  protectAdminController,
} = require("../controllers/user.controller");
const { authUser, isAdmin } = require("../middleware/auth");
const userRoutes = express.Router();

// REGISTER USER
userRoutes.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("address", "Address is required").not().isEmpty(),
  ],
  registerController
);

// LOGIN USER
userRoutes.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  loginController
);

// UPDATE PASSWORD WHEN USER LOGIN
userRoutes.put("/update-password/:id", authUser, updatePasswordController);

// USER PROTECT ROUTE
userRoutes.get("/user-protect", authUser, protectUserController);

// ADMIN PROTECT ROUTE
userRoutes.get(
  "/admin-protect",
  authUser,
  isAdmin,
  protectAdminController
);

module.exports = userRoutes;
