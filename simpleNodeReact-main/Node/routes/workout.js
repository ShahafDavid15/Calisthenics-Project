const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all workouts
// Retrieves all workouts from the database ordered by creation date descending
router.get("/", (req, res) => {
  const query = `
    SELECT id, exercise, repetitions, duration, created_at
    FROM workouts
    ORDER BY created_at DESC
  `;
  // Execute query to fetch workouts
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    // Return the results as JSON
    res.json(results);
  });
});

// POST add new workout
// Adds a new workout entry to the database
router.post("/", (req, res) => {
  const { exercise, repetitions, duration } = req.body;

  const query = `
    INSERT INTO workouts (exercise, repetitions, duration)
    VALUES (?, ?, ?)
  `;
  // Execute insert query
  db.query(query, [exercise, repetitions, duration], (err, result) => {
    if (err) return res.status(500).json({ error: "Insert error" });
    // Return success message with the inserted workout ID
    res.status(201).json({ message: "Workout added", id: result.insertId });
  });
});

// DELETE workout by id
// Deletes a workout from the database by its ID
router.delete("/:id", (req, res) => {
  const workoutId = req.params.id;

  const query = `
    DELETE FROM workouts
    WHERE id = ?
  `;
  // Execute delete query
  db.query(query, [workoutId], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete error" });
    // Check if any row was deleted (workout found)
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }
    // Return success message
    res.json({ message: "Workout deleted successfully" });
  });
});

module.exports = router;
