const { AppError } = require("../services/userService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Internal server error" });
}

class UsersController {
  constructor(service) {
    this.service = service;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.forgotUsername = this.forgotUsername.bind(this);
  }

  async register(req, res) {
    try {
      const result = await this.service.registerUser(req.body);
      return res.status(201).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async login(req, res) {
    try {
      const result = await this.service.loginUser(req.body);
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
      const user = await this.service.getUserById(requestedId);
      return res.json(user);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.service.getAllUsersWithMembership();
      return res.json(users);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updateProfile(req, res) {
    try {
      const data = { ...req.body, username: req.user.username };
      const result = await this.service.updateUserProfile(data);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async forgotPassword(req, res) {
    try {
      const result = await this.service.requestPasswordReset(req.body.email);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async resetPassword(req, res) {
    try {
      const result = await this.service.resetPassword(req.body);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updatePassword(req, res) {
    try {
      const data = { ...req.body, username: req.user.username };
      const result = await this.service.updatePasswordFromProfile(data);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async forgotUsername(req, res) {
    try {
      const result = await this.service.sendForgotUsernameEmail(req.body.email);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = { UsersController };
