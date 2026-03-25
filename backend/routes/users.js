const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// Brute-force protection: only on unauthenticated auth endpoints (not on /profile, /:id, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "יותר מדי ניסיונות התחברות, נסה שוב בעוד 15 דקות" },
});

const userRepository = require("../repositories/userRepository");
const { UserService } = require("../services/userService");
const { UsersController } = require("../controllers/usersController");

const userService = new UserService(userRepository);
const usersController = new UsersController(userService);

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

// Public routes (no auth) — rate-limited to slow password-guessing / abuse
router.post("/",               authLimiter, ...registerValidation,       handleValidation, usersController.register);
router.post("/login",          authLimiter, ...loginValidation,          handleValidation, usersController.login);
router.post("/forgot-password",authLimiter, ...forgotPasswordValidation, handleValidation, usersController.forgotPassword);
router.post("/reset-password", authLimiter, ...resetPasswordValidation,  handleValidation, usersController.resetPassword);
router.post("/forgot-username",authLimiter, ...forgotUsernameValidation, handleValidation, usersController.forgotUsername);

// Protected routes
router.get("/:id",    authMiddleware,                                                        usersController.getUserById);
router.get("/",       authMiddleware, requireAdmin,                                          usersController.getAllUsers);
router.put("/profile",authMiddleware, ...profileValidation,  handleValidation,               usersController.updateProfile);
router.put("/password",authMiddleware,...passwordValidation, handleValidation,               usersController.updatePassword);

module.exports = router;
