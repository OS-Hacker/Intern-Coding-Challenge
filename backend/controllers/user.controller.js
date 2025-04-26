const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
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

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        address: user.address,
      },
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    // Return success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        address: user.address,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const loginController = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    // Find user by email (include password field)
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    // Prepare JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    // Return success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

const updatePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params; // Correct way to get params


    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Update password (model should hash it automatically if set up correctly)
    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// protect-user
const protectUserController = async (req, res) => {
  try {
    await res.status(200).json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

// protect-admin
const protectAdminController = async (req, res, next) => {
  try {
    await res.status(200).json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  registerController,
  loginController,
  updatePasswordController,
  protectUserController,
  protectAdminController,
};
