/**
 * This module manages CRUD operations for the "membership" table.
 *  Retrieve all memberships.
 *  Add new memberships with automatic VAT calculation.
 *  Update existing memberships with validations.
 *  Delete memberships by ID.
 */

const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

// VAT percentage
const VAT_PERCENT = 18;

// GET all memberships sorted by price
router.get("/", (req, res) => {
  const query = `
    SELECT membership_id, name, price, price_with_vat, duration_days, entry_count
    FROM membership
    ORDER BY price ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching memberships:", err);
      return res
        .status(500)
        .json({ error: "Database error fetching memberships" });
    }
    res.json(results);
  });
});

// POST add new membership
router.post("/", (req, res) => {
  const { name, price, duration_days, entry_count } = req.body;

  if (
    !name ||
    !price ||
    duration_days === undefined ||
    duration_days === null
  ) {
    return res.status(400).json({
      error: "Name, price, and duration_days are required.",
    });
  }

  if (
    isNaN(price) ||
    isNaN(duration_days) ||
    price <= 0 ||
    duration_days <= 0
  ) {
    return res.status(400).json({
      error: "Price and duration_days must be positive numbers.",
    });
  }

  const priceWithVat = (price * (1 + VAT_PERCENT / 100)).toFixed(2);

  const query = `
    INSERT INTO membership (name, price, price_with_vat, duration_days, entry_count)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, price, priceWithVat, duration_days, entry_count || 0],
    (err, result) => {
      if (err) {
        console.error("Error inserting membership:", err);
        return res
          .status(500)
          .json({ error: "Database error adding membership" });
      }

      res.status(201).json({
        message: "Membership added successfully",
        membership_id: result.insertId,
        name,
        price,
        price_with_vat: priceWithVat,
        duration_days,
        entry_count: entry_count || 0,
      });
    }
  );
});

// PUT update existing membership
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, duration_days, entry_count } = req.body;

  if (
    !name ||
    !price ||
    duration_days === undefined ||
    duration_days === null
  ) {
    return res.status(400).json({
      error: "Name, price, and duration_days are required for update.",
    });
  }

  if (
    isNaN(price) ||
    isNaN(duration_days) ||
    price <= 0 ||
    duration_days <= 0 ||
    entry_count < 0
  ) {
    return res.status(400).json({
      error: "Price, duration_days must be positive; entry_count >= 0",
    });
  }

  const priceWithVat = (price * (1 + VAT_PERCENT / 100)).toFixed(2);

  const query = `
    UPDATE membership
    SET name = ?, price = ?, price_with_vat = ?, duration_days = ?, entry_count = ?
    WHERE membership_id = ?
  `;

  db.query(
    query,
    [name, price, priceWithVat, duration_days, entry_count || 0, id],
    (err, result) => {
      if (err) {
        console.error("Error updating membership:", err);
        return res
          .status(500)
          .json({ error: "Database error updating membership" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Membership not found." });
      }

      res.json({
        message: "Membership updated successfully",
        membership_id: id,
        name,
        price,
        price_with_vat: priceWithVat,
        duration_days,
        entry_count: entry_count || 0,
      });
    }
  );
});

// DELETE a membership
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM membership WHERE membership_id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting membership:", err);
      return res
        .status(500)
        .json({ error: "Database error deleting membership" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membership not found." });
    }

    res.json({ message: "Membership deleted successfully" });
  });
});

module.exports = router;
