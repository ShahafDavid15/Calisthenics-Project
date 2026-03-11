const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const userRepository = require("../repositories/userRepository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function hashPassword(plain) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plain, 10, (err, hash) => {
      if (err) return reject(err);
      resolve(hash);
    });
  });
}

function comparePassword(plain, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plain, hash, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
}

function signJwt(payload, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET, options, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

function verifyJwt(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

class UserService {
  async registerUser({ username, password }) {
    if (!username || !password) {
      throw new AppError("Username and password are required", 400);
    }

    const existing = await userRepository.findUserByUsername(username);
    if (existing) {
      throw new AppError("Username already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const result = await userRepository.createUser({
      username,
      passwordHash,
    });

    return {
      message: "User registered",
      user_id: result.insertId,
      username,
    };
  }

  async loginUser({ username, password }) {
    if (!username || !password) {
      throw new AppError("Username and password are required", 400);
    }

    const user = await userRepository.findUserByUsername(username);
    if (!user) {
      throw new AppError("Username or password is incorrect", 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError("Username or password is incorrect", 401);
    }

    const token = await signJwt(
      { userId: user.user_id, username: user.username, role: user.role },
      { expiresIn: "7d" }
    );

    return {
      message: "Login successful",
      token,
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    };
  }

  async getUserById(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async getAllUsersWithMembership() {
    return userRepository.getAllUsersWithLatestMembership();
  }

  async updateUserProfile(data) {
    const { username, firstName, lastName, phone, email, birthDate, gender } =
      data;

    if (!username || !firstName || !lastName || !phone || !email || !gender) {
      throw new AppError("Missing required fields", 400);
    }

    const result = await userRepository.updateUserProfile({
      username,
      firstName,
      lastName,
      phone,
      email,
      birthDate,
      gender,
    });

    if (result.affectedRows === 0) {
      throw new AppError("User not found", 404);
    }

    // Try to send email, but do not fail the main operation if email fails
    try {
      await sendEmail(
        email,
        "עדכון פרופיל",
        `שלום ${firstName}, הפרופיל עודכן`
      );
      return {
        message: "Profile updated and email sent successfully",
      };
    } catch (err) {
      return {
        message: "Profile updated, but failed to send email",
      };
    }
  }

  async requestPasswordReset(email) {
    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError("No user with that email", 404);
    }

    const token = await signJwt(
      { userId: user.user_id },
      { expiresIn: "15m" }
    );
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    try {
      await sendEmail(
        email,
        "Reset Your Password",
        `Hello ${user.username},\nClick here to reset your password: ${resetLink}\nLink valid for 15 minutes.`
      );
    } catch (e) {
      throw new AppError("Failed to send reset email", 500);
    }

    return {
      message: "Reset email sent",
    };
  }

  async resetPassword({ token, newPassword }) {
    if (!token || !newPassword) {
      throw new AppError("Token and new password are required", 400);
    }

    let decoded;
    try {
      decoded = await verifyJwt(token);
    } catch (e) {
      throw new AppError("Invalid or expired token", 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updateUserPasswordById(
      decoded.userId,
      passwordHash
    );

    return {
      message: "Password reset successful",
    };
  }

  async updatePasswordFromProfile({ username, currentPassword, newPassword }) {
    if (!username || !currentPassword || !newPassword) {
      throw new AppError("Missing required fields", 400);
    }

    const user = await userRepository.findUserByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updateUserPasswordByUsername(username, passwordHash);

    if (user.email) {
      try {
        await sendEmail(
          user.email,
          "סיסמתך שונתה בהצלחה",
          `שלום ${user.first_name || username},\n\nסיסמתך שונתה בהצלחה.\nאם לא ביצעת שינוי זה, אנא צור קשר איתנו מיידית.\n\nתודה,\nצוות Calisthenics`
        );
      } catch (err) {
        console.error("Failed to send password change email:", err);
      }
    }

    return {
      message: "Password updated successfully",
    };
  }

  async sendForgotUsernameEmail(email) {
    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const result = await userRepository.getUsernameByEmail(email);
    if (!result) {
      throw new AppError("No user with that email", 404);
    }

    const { username } = result;

    try {
      await sendEmail(
        email,
        "Your Username",
        `Hello,\nYour username is: ${username}`
      );
    } catch (e) {
      throw new AppError("Failed to send username email", 500);
    }

    return {
      message: "Username sent to your email",
    };
  }
}

module.exports = {
  userService: new UserService(),
  AppError,
};