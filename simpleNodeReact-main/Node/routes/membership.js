const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all memberships
router.get("/", (req, res) => {
  const query = `
    SELECT membership_id, name, price, duration_days
    FROM membership
    ORDER BY price ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// POST add new membership
router.post("/", (req, res) => {
  const { name, price, duration_days } = req.body;

  const query = `
    INSERT INTO membership (name, price, duration_days)
    VALUES (?, ?, ?)
  `;
  db.query(query, [name, price, duration_days], (err, result) => {
    if (err) return res.status(500).json({ error: "Insert error" });
    res
      .status(201)
      .json({ message: "Membership added", membership_id: result.insertId });
  });
});

module.exports = router;
