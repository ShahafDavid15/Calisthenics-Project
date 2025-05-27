const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all users
router.get("/", (req, res) => {
  const query = `
    SELECT user_id, first_name, last_name, birth_date, email, phone, gender, password_hash
    FROM users
    ORDER BY password_hash ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// POST new user
router.post("/", (req, res) => {
  const {
    first_name,
    last_name,
    birth_date,
    email,
    phone,
    gender,
    password_hash,
  } = req.body;

  const query = `
    INSERT INTO users (first_name, last_name, birth_date, email, phone, gender, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [first_name, last_name, birth_date, email, phone, gender, password_hash],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Insert error" });
      res.status(201).json({ message: "User added", user_id: result.insertId });
    }
  );
});

module.exports = router;
