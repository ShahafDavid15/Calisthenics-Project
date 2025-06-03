const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all users
router.get("/", (req, res) => {
  const query = `
    SELECT user_id, username
    FROM users
    ORDER BY user_id ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// POST add new user (registration)
router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Check if user exists
  const checkQuery = `SELECT * FROM users WHERE username = ?`;
  db.query(checkQuery, [username], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).json({ error: "DB error" });

    if (checkResults.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Insert new user
    const insertQuery = `
      INSERT INTO users (username, password)
      VALUES (?, ?)
    `;
    db.query(insertQuery, [username, password], (err, result) => {
      if (err) return res.status(500).json({ error: "Insert error" });

      res
        .status(201)
        .json({ message: "User registered", user_id: result.insertId });
    });
  });
});

// POST user login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username, password);

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const query = `
    SELECT user_id, username
    FROM users
    WHERE username = ? AND password = ?
  `;
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      user_id: results[0].user_id,
      username: results[0].username,
    });
  });
});

// POST save or update user profile
router.post("/profile", (req, res) => {
  const { user_id, firstName, lastName, phone, email, birthDate, gender } =
    req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!firstName || !lastName || !phone || !email || !birthDate || !gender) {
    return res.status(400).json({ error: "All profile fields are required" });
  }

  const query = `
    INSERT INTO profiles (user_id, first_name, last_name, phone, email, birth_date, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      last_name = VALUES(last_name),
      phone = VALUES(phone),
      email = VALUES(email),
      birth_date = VALUES(birth_date),
      gender = VALUES(gender)
  `;

  db.query(
    query,
    [user_id, firstName, lastName, phone, email, birthDate, gender],
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(200).json({ message: "Profile saved successfully" });
    }
  );
});

module.exports = router;
