/**
 * This Module managing user workout exercises.
 * - fetch exercises for a user
 * - add new exercise 
 * - update an exercise
 * - DELETE an exercise
 * 
 * Validations:
 * - Required fields check
 * - Future dates blocked
 */

const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all exercises for a specific user
router.get("/", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "Missing user_id" });

  const query = `
    SELECT id, user_id, exercise, repetitions, workout_date
    FROM workout_exercises
    WHERE user_id = ?
    ORDER BY workout_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching workout exercises:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
});

// POST - Add a new exercise
router.post("/", (req, res) => {
  const { user_id, exercise, repetitions, workout_date } = req.body;

  if (!user_id || !exercise || repetitions == null || !workout_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Block future dates
  const today = new Date().toISOString().split("T")[0];
  if (workout_date > today) {
    return res.status(400).json({ error: "לא ניתן להוסיף אימון בעתיד" });
  }

  const query = `
    INSERT INTO workout_exercises (user_id, exercise, repetitions, workout_date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [user_id, exercise, repetitions, workout_date],
    (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ error: "DB insert error" });
      }

      res.status(201).json({
        message: "Exercise added successfully",
        id: result.insertId,
      });
    }
  );
});

// PUT - Update an exercise
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { exercise, repetitions, workout_date } = req.body;

  if (!exercise || repetitions == null || !workout_date) {
    return res.status(400).json({ error: "Missing fields to update" });
  }

  // Block future dates
  const today = new Date().toISOString().split("T")[0];
  if (workout_date > today) {
    return res.status(400).json({ error: "לא ניתן לעדכן אימון לעתיד" });
  }

  const query = `
    UPDATE workout_exercises
    SET exercise = ?, repetitions = ?, workout_date = ?
    WHERE id = ?
  `;

  db.query(query, [exercise, repetitions, workout_date, id], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ error: "DB update error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.json({ message: "Exercise updated successfully" });
  });
});

// DELETE - Delete an exercise
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  const query = `DELETE FROM workout_exercises WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "DB delete error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.json({ message: "Exercise deleted successfully" });
  });
});

module.exports = router;
