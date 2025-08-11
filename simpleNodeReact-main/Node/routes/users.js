const express = require("express");
const router = express.Router();
const db = require("../db"); // Database connection module
const bcrypt = require("bcrypt");

// === Registration ===
// POST /api/users
router.post("/", (req, res) => {
  const { username, password } = req.body;

  // Check that username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Check if the username already exists
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (results.length > 0) {
        // Username already taken
        return res.status(409).json({ error: "Username already exists" });
      }

      // Hash the password before storing
      bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr)
          return res.status(500).json({ error: "Password encryption failed" });

        // Insert the new user into the database
        db.query(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hash],
          (insertErr, result) => {
            if (insertErr)
              return res.status(500).json({ error: "Insert error" });

            // Respond with success and the new user's id and username
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

// === Login ===
// POST /api/users/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate required fields
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Find user by username
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) {
        // User not found
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const user = results[0];

      // Compare submitted password with hashed password in DB
      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr) return res.status(500).json({ error: "Login failed" });

        if (!isMatch) {
          // Password does not match
          return res
            .status(401)
            .json({ error: "Invalid username or password" });
        }

        // Successful login
        res.status(200).json({
          message: "Login successful",
          user_id: user.user_id,
          username: user.username,
        });
      });
    }
  );
});

// === Get user by ID ===
// GET /api/users/:id
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  // Query user by user_id
  db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "User not found" });

      // Return the first matching user row
      res.json(results[0]);
    }
  );
});

// === Update user profile ===
// PUT /api/users/profile
router.put("/profile", (req, res) => {
  // Destructure user profile fields from request body
  const { username, firstName, lastName, phone, email, birthDate, gender } =
    req.body;

  // Validate required fields
  if (!username || !firstName || !lastName || !phone || !email || !gender) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Use null if birthDate is empty or undefined
  const birthDateToUse = birthDate ? birthDate : null;

  const sql = `
    UPDATE users
    SET first_name = ?, last_name = ?, phone = ?, email = ?, birth_date = ?, gender = ?
    WHERE username = ?
  `;

  // Execute the update query
  db.query(
    sql,
    [firstName, lastName, phone, email, birthDateToUse, gender, username],
    (err, results) => {
      if (err) {
        console.error("DB error updating user profile:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Check if any rows were updated (user found)
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Successfully updated profile
      res.json({ message: "Profile updated successfully" });
    }
  );
});

module.exports = router;
