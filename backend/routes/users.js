const express = require("express");
const router = express.Router();

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

// Public routes (no auth)
router.post("/",               ...registerValidation,       handleValidation, usersController.register);
router.post("/login",          ...loginValidation,          handleValidation, usersController.login);
router.post("/forgot-password",...forgotPasswordValidation, handleValidation, usersController.forgotPassword);
router.post("/reset-password", ...resetPasswordValidation,  handleValidation, usersController.resetPassword);
router.post("/forgot-username",...forgotUsernameValidation, handleValidation, usersController.forgotUsername);

// Protected routes
router.get("/:id",    authMiddleware,                                                        usersController.getUserById);
router.get("/",       authMiddleware, requireAdmin,                                          usersController.getAllUsers);
router.put("/profile",authMiddleware, ...profileValidation,  handleValidation,               usersController.updateProfile);
router.put("/password",authMiddleware,...passwordValidation, handleValidation,               usersController.updatePassword);

module.exports = router;
