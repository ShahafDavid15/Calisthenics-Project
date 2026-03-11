const { userService, AppError } = require("../services/userService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Internal server error" });
}

class UsersController {
  async register(req, res) {
    try {
      const result = await userService.registerUser(req.body);
      return res.status(201).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async login(req, res) {
    try {
      const result = await userService.loginUser(req.body);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getUserById(req, res) {
    try {
      const requestedId = parseInt(req.params.id, 10);
      const { userId, role } = req.user;
      if (requestedId !== userId && role !== "admin") {
        return res.status(403).json({ error: "אין הרשאה לצפות בפרופיל זה" });
      }
      const user = await userService.getUserById(requestedId);
      return res.json(user);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsersWithMembership();
      return res.json(users);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updateProfile(req, res) {
    try {
      const data = { ...req.body, username: req.user.username };
      const result = await userService.updateUserProfile(data);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async forgotPassword(req, res) {
    try {
      const result = await userService.requestPasswordReset(req.body.email);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async resetPassword(req, res) {
    try {
      const result = await userService.resetPassword(req.body);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updatePassword(req, res) {
    try {
      const data = { ...req.body, username: req.user.username };
      const result = await userService.updatePasswordFromProfile(data);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async forgotUsername(req, res) {
    try {
      const result = await userService.sendForgotUsernameEmail(req.body.email);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = new UsersController();