const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// Registration
router.post("/", (req, res) => usersController.register(req, res));

// Login
router.post("/login", (req, res) => usersController.login(req, res));

// Get user by ID
router.get("/:id", (req, res) => usersController.getUserById(req, res));

// Get all users with their latest membership info
router.get("/", (req, res) => usersController.getAllUsers(req, res));

// Update user profile
router.put("/profile", (req, res) => usersController.updateProfile(req, res));

// Forgot Password
router.post("/forgot-password", (req, res) => usersController.forgotPassword(req, res));

// Reset Password
router.post("/reset-password", (req, res) => usersController.resetPassword(req, res));

// Update password from profile
router.put("/password", (req, res) => usersController.updatePassword(req, res));

// Forgot Username
router.post("/forgot-username", (req, res) => usersController.forgotUsername(req, res));

module.exports = router;