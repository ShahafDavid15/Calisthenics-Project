const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all memberships
// Fetches all memberships from the database, ordered by price ascending
router.get("/", (req, res) => {
  const query = `
    SELECT membership_id, name, price, duration_days
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
    // Return the list of memberships as JSON
    res.json(results);
  });
});

// POST add new membership
// Adds a new membership record to the database after validating input
router.post("/", (req, res) => {
  const { name, price, duration_days } = req.body;

  // Basic validation: check if required fields are present
  if (
    !name ||
    !price ||
    duration_days === undefined ||
    duration_days === null
  ) {
    return res
      .status(400)
      .json({ error: "Name, price, and duration_days are required." });
  }

  // Validate that price and duration_days are positive numbers
  if (
    isNaN(price) ||
    isNaN(duration_days) ||
    price <= 0 ||
    duration_days <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Price and duration_days must be positive numbers." });
  }

  const query = `
    INSERT INTO membership (name, price, duration_days)
    VALUES (?, ?, ?)
  `;

  // Insert the new membership into the database
  db.query(query, [name, price, duration_days], (err, result) => {
    if (err) {
      console.error("Error inserting membership:", err);
      return res
        .status(500)
        .json({ error: "Database error adding membership" });
    }

    // Return success message along with the inserted membership's ID and details
    res.status(201).json({
      message: "Membership added successfully",
      membership_id: result.insertId,
      name,
      price,
      duration_days,
    });
  });
});

// PUT update existing membership
// Updates an existing membership by ID after validating input
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, duration_days } = req.body;

  // Validate required fields for update
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

  // Validate price and duration_days values
  if (
    isNaN(price) ||
    isNaN(duration_days) ||
    price <= 0 ||
    duration_days <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Price and duration_days must be positive numbers." });
  }

  const query = `
    UPDATE membership
    SET name = ?, price = ?, duration_days = ?
    WHERE membership_id = ?
  `;

  // Perform the update query
  db.query(query, [name, price, duration_days, id], (err, result) => {
    if (err) {
      console.error("Error updating membership:", err);
      return res
        .status(500)
        .json({ error: "Database error updating membership" });
    }
    // Check if any row was affected (i.e. if membership was found)
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membership not found." });
    }
    // Return success message
    res.json({ message: "Membership updated successfully" });
  });
});

// DELETE a membership
// Deletes a membership by ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM membership
    WHERE membership_id = ?
  `;

  // Perform the delete query
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting membership:", err);
      return res
        .status(500)
        .json({ error: "Database error deleting membership" });
    }
    // Check if any row was deleted (i.e. if membership existed)
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membership not found." });
    }
    // Return success message
    res.json({ message: "Membership deleted successfully" });
  });
});

module.exports = router;
