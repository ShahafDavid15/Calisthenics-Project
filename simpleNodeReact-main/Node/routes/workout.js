const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all workouts
router.get("/", (req, res) => {
  const query = `
    SELECT workout_id, workout_time, workout_date
    FROM workout
    ORDER BY workout_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// POST add new workout
router.post("/", (req, res) => {
  const { workout_time, workout_date } = req.body;

  const query = `
    INSERT INTO workout (workout_time, workout_date)
    VALUES (?, ?)
  `;
  db.query(query, [workout_time, workout_date], (err, result) => {
    if (err) return res.status(500).json({ error: "Insert error" });
    res
      .status(201)
      .json({ message: "Workout added", workout_id: result.insertId });
  });
});

module.exports = router;
