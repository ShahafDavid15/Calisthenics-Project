/**
 * This module manages user-related operations:
 * - User registration and login.
 * - Fetching user data.
 * - Updating user profile and sending confirmation email.
 * - Handling password and username recovery via email.
 */

const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

// Registration
router.post("/", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ error: "Username and password are required" });

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (results.length > 0)
        return res.status(409).json({ error: "Username already exists" });

      bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr)
          return res.status(500).json({ error: "Password encryption failed" });

        db.query(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hash],
          (insertErr, result) => {
            if (insertErr)
              return res.status(500).json({ error: "Insert error" });
            res.status(201).json({
              message: "User registered",
              user_id: result.insertId,
              username,
            });
          }
        );
      });
    }
  );
});

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ error: "Username and password are required" });

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res
          .status(401)
          .json({ error: "Username or password is incorrect" });

      const user = results[0];
      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr) return res.status(500).json({ error: "Login failed" });
        if (!isMatch)
          return res
            .status(401)
            .json({ error: "Username or password is incorrect" });

        res.json({
          message: "Login successful",
          user_id: user.user_id,
          username: user.username,
          role: user.role,
        });
      });
    }
  );
});

// Get user by ID
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "User not found" });
      res.json(results[0]);
    }
  );
});

// Get all users with membership info 
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      u.user_id,
      u.username,
      u.email,
      m.name AS membership_type,
      um.start_date,
      um.end_date
    FROM users u
    LEFT JOIN user_membership um ON u.user_id = um.user_id
    LEFT JOIN membership m ON um.membership_id = m.membership_id
    ORDER BY u.user_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Update user profile
router.put("/profile", (req, res) => {
  const { username, firstName, lastName, phone, email, birthDate, gender } =
    req.body;
  if (!username || !firstName || !lastName || !phone || !email || !gender) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `UPDATE users SET first_name = ?, last_name = ?, phone = ?, email = ?, birth_date = ?, gender = ? WHERE username = ?`;
  db.query(
    sql,
    [firstName, lastName, phone, email, birthDate || null, gender, username],
    async (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

      try {
        await sendEmail(
          email,
          "עדכון פרופיל",
          `שלום ${firstName}, הפרופיל עודכן`
        );
        console.log("Email sent to", email);
        res.json({ message: "Profile updated and email sent successfully" });
      } catch (err) {
        console.error("Failed to send email:", err);
        res.json({ message: "Profile updated, but failed to send email" });
      }
    }
  );
});

// Forgot Password
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "No user with that email" });

    const user = results[0];
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    sendEmail(
      email,
      "Reset Your Password",
      `Hello ${user.username},\nClick here to reset your password: ${resetLink}\nLink valid for 15 minutes.`
    )
      .then(() => res.json({ message: "Reset email sent" }))
      .catch(() =>
        res.status(500).json({ error: "Failed to send reset email" })
      );
  });
});

// Reset Password
router.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res
      .status(400)
      .json({ error: "Token and new password are required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ error: "Invalid or expired token" });

    const userId = decoded.userId;
    bcrypt.hash(newPassword, 10, (hashErr, hash) => {
      if (hashErr)
        return res.status(500).json({ error: "Password hash failed" });

      db.query(
        "UPDATE users SET password = ? WHERE user_id = ?",
        [hash, userId],
        (dbErr) => {
          if (dbErr) return res.status(500).json({ error: "DB error" });
          res.json({ message: "Password reset successful" });
        }
      );
    });
  });
});

// Update password from profile
router.put("/password", (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!username || !currentPassword || !newPassword)
    return res.status(400).json({ error: "Missing required fields" });

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (results.length === 0)
        return res.status(404).json({ error: "User not found" });

      const user = results[0];
      bcrypt.compare(currentPassword, user.password, (compareErr, isMatch) => {
        if (compareErr)
          return res
            .status(500)
            .json({ error: "Password verification failed" });
        if (!isMatch)
          return res
            .status(401)
            .json({ error: "Current password is incorrect" });

        bcrypt.hash(newPassword, 10, (hashErr, hash) => {
          if (hashErr)
            return res.status(500).json({ error: "Password hashing failed" });

          db.query(
            "UPDATE users SET password = ? WHERE username = ?",
            [hash, username],
            (updateErr) => {
              if (updateErr)
                return res.status(500).json({ error: "DB update failed" });
              res.json({ message: "Password updated successfully" });
            }
          );
        });
      });
    }
  );
});

// Forgot Username
router.post("/forgot-username", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  db.query(
    "SELECT username FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "No user with that email" });

      const { username } = results[0];
      sendEmail(email, "Your Username", `Hello,\nYour username is: ${username}`)
        .then(() => res.json({ message: "Username sent to your email" }))
        .catch(() =>
          res.status(500).json({ error: "Failed to send username email" })
        );
    }
  );
});

module.exports = router;
