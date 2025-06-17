const express = require("express");
const router = express.Router();
const db = require("../db"); // Assuming db.js exports your database connection/pool

// GET all memberships
router.get("/", (req, res) => {
  const query = `
    SELECT membership_id, name, price, duration_days
    FROM membership
    ORDER BY price ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching memberships:", err); // Log the error for debugging
      return res.status(500).json({ error: "Database error fetching memberships" });
    }
    res.json(results);
  });
});

// POST add new membership
router.post("/", (req, res) => {
  const { name, price, duration_days } = req.body;

  // Basic validation
  if (!name || !price || duration_days === undefined || duration_days === null) {
    return res.status(400).json({ error: "Name, price, and duration_days are required." });
  }
  if (isNaN(price) || isNaN(duration_days) || price <= 0 || duration_days <= 0) {
      return res.status(400).json({ error: "Price and duration_days must be positive numbers." });
  }


  const query = `
    INSERT INTO membership (name, price, duration_days)
    VALUES (?, ?, ?)
  `;
  db.query(query, [name, price, duration_days], (err, result) => {
    if (err) {
      console.error("Error inserting membership:", err); // Log the error for debugging
      return res.status(500).json({ error: "Database error adding membership" });
    }
    res
      .status(201)
      .json({ message: "Membership added successfully", membership_id: result.insertId, name, price, duration_days }); // Return the new membership data
  });
});

// PUT update existing membership
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, duration_days } = req.body;

  // Basic validation
  if (!name || !price || duration_days === undefined || duration_days === null) {
    return res.status(400).json({ error: "Name, price, and duration_days are required for update." });
  }
  if (isNaN(price) || isNaN(duration_days) || price <= 0 || duration_days <= 0) {
    return res.status(400).json({ error: "Price and duration_days must be positive numbers." });
  }


  const query = `
    UPDATE membership
    SET name = ?, price = ?, duration_days = ?
    WHERE membership_id = ?
  `;
  db.query(query, [name, price, duration_days, id], (err, result) => {
    if (err) {
      console.error("Error updating membership:", err); // Log the error for debugging
      return res.status(500).json({ error: "Database error updating membership" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membership not found." });
    }
    res.json({ message: "Membership updated successfully" });
  });
});

// DELETE a membership
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM membership
    WHERE membership_id = ?
  `;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting membership:", err); // Log the error for debugging
      return res.status(500).json({ error: "Database error deleting membership" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membership not found." });
    }
    res.json({ message: "Membership deleted successfully" });
  });
});

module.exports = router;