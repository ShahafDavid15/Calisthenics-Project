const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all workouts
router.get("/", (req, res) => {
  const query = `
    SELECT id, exercise, repetitions, duration, created_at
    FROM workouts
    ORDER BY created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// POST add new workout
router.post("/", (req, res) => {
  const { exercise, repetitions, duration } = req.body;

  const query = `
    INSERT INTO workouts (exercise, repetitions, duration)
    VALUES (?, ?, ?)
  `;
  db.query(query, [exercise, repetitions, duration], (err, result) => {
    if (err) return res.status(500).json({ error: "Insert error" });
    res
      .status(201)
      .json({ message: "Workout added", id: result.insertId });
  });
});

// DELETE workout by id
router.delete("/:id", (req, res) => {
  const workoutId = req.params.id;

  const query = `
    DELETE FROM workouts
    WHERE id = ?
  `;
  db.query(query, [workoutId], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete error" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }
    res.json({ message: "Workout deleted successfully" });
  });
});

module.exports = router;