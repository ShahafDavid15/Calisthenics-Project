const express = require("express");
const router = express.Router();
const db = require("../db"); // ודא שהקובץ db.js מייצא את החיבור למסד הנתונים

// ✅ POST - Register new user
router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const checkQuery = `SELECT * FROM users WHERE username = ?`;
  db.query(checkQuery, [username], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).json({ error: "DB error" });

    if (checkResults.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const insertQuery = `
      INSERT INTO users (username, password)
      VALUES (?, ?)
    `;
    db.query(insertQuery, [username, password], (err, result) => {
      if (err) return res.status(500).json({ error: "Insert error" });

      res.status(201).json({
        message: "User registered",
        user_id: result.insertId,
        username,
      });
    });
  });
});

// ✅ POST - Login user
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];

    res.status(200).json({
      message: "Login successful",
      user_id: user.user_id,
      username: user.username,
    });
  });
});

// ✅ GET - Get user profile by user_id
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT user_id, username, first_name, last_name, phone, email, birth_date, gender
    FROM users
    WHERE user_id = ?
  `;
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    let formattedBirthDate = "";

    if (user.birth_date) {
      const dbDate = new Date(user.birth_date);
      const year = dbDate.getFullYear();
      const month = (dbDate.getMonth() + 1).toString().padStart(2, "0");
      const day = dbDate.getDate().toString().padStart(2, "0");
      formattedBirthDate = `${year}-${month}-${day}`;
    }

    res.json({
      user_id: user.user_id,
      username: user.username,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      email: user.email || "",
      birth_date: formattedBirthDate,
      gender: user.gender || "",
    });
  });
});

// ✅ POST - Update user profile
router.post("/profile", (req, res) => {
  const { username, firstName, lastName, phone, email, birthDate, gender } =
    req.body;

  if (
    !username ||
    firstName === undefined ||
    lastName === undefined ||
    phone === undefined ||
    email === undefined ||
    birthDate === undefined ||
    gender === undefined
  ) {
    return res.status(400).json({
      error: "All profile fields are required and cannot be undefined",
    });
  }

  const query = `
    UPDATE users
    SET first_name = ?, last_name = ?, phone = ?, email = ?, birth_date = ?, gender = ?
    WHERE username = ?
  `;

  db.query(
    query,
    [firstName, lastName, phone, email, birthDate, gender, username],
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "Profile updated successfully" });
    }
  );
});

module.exports = router;
