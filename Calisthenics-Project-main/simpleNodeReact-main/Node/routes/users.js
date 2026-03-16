const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
const {
  handleValidation,
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  forgotUsernameValidation,
  profileValidation,
  passwordValidation,
} = require("../middleware/validators");

// Public routes (no auth)
router.post("/", ...registerValidation, handleValidation, (req, res) => usersController.register(req, res));
router.post("/login", ...loginValidation, handleValidation, (req, res) => usersController.login(req, res));
router.post("/forgot-password", ...forgotPasswordValidation, handleValidation, (req, res) => usersController.forgotPassword(req, res));
router.post("/reset-password", ...resetPasswordValidation, handleValidation, (req, res) => usersController.resetPassword(req, res));
router.post("/forgot-username", ...forgotUsernameValidation, handleValidation, (req, res) => usersController.forgotUsername(req, res));

// Protected routes
router.get("/:id", authMiddleware, (req, res) => usersController.getUserById(req, res));
router.get("/", authMiddleware, requireAdmin, (req, res) => usersController.getAllUsers(req, res));
router.put("/profile", authMiddleware, ...profileValidation, handleValidation, (req, res) => usersController.updateProfile(req, res));
router.put("/password", authMiddleware, ...passwordValidation, handleValidation, (req, res) => usersController.updatePassword(req, res));

module.exports = router;