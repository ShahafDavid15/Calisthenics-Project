const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");

// Public routes (no auth)
router.post("/", (req, res) => usersController.register(req, res));
router.post("/login", (req, res) => usersController.login(req, res));
router.post("/forgot-password", (req, res) => usersController.forgotPassword(req, res));
router.post("/reset-password", (req, res) => usersController.resetPassword(req, res));
router.post("/forgot-username", (req, res) => usersController.forgotUsername(req, res));

// Protected routes
router.get("/:id", authMiddleware, (req, res) => usersController.getUserById(req, res));
router.get("/", authMiddleware, requireAdmin, (req, res) => usersController.getAllUsers(req, res));
router.put("/profile", authMiddleware, (req, res) => usersController.updateProfile(req, res));
router.put("/password", authMiddleware, (req, res) => usersController.updatePassword(req, res));

module.exports = router;