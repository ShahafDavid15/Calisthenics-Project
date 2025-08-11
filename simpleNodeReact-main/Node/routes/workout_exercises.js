const express = require("express");
const router = express.Router();
const db = require("../db");

// GET כל התרגילים של משתמש מסוים (עם user_id בפרמטר query)
router.get("/", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const query = `
    SELECT id, user_id, exercise, repetitions, duration, created_at
    FROM workout_exercises
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching workout exercises:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
});

// POST - הוספת תרגיל חדש למשתמש
router.post("/", (req, res) => {
  const { user_id, exercise, repetitions, duration } = req.body;

  if (!user_id || !exercise || repetitions == null || duration == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // הוספה לטבלה
  const query = `
    INSERT INTO workout_exercises (user_id, exercise, repetitions, duration)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [user_id, exercise, repetitions, duration], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "DB insert error" });
    }

    res.status(201).json({
      message: "Exercise added successfully",
      id: result.insertId,
    });
  });
});

// PUT - עדכון תרגיל קיים לפי id
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { exercise, repetitions, duration } = req.body;

  if (!exercise || repetitions == null || duration == null) {
    return res.status(400).json({ error: "Missing fields to update" });
  }

  const query = `
    UPDATE workout_exercises
    SET exercise = ?, repetitions = ?, duration = ?
    WHERE id = ?
  `;

  db.query(query, [exercise, repetitions, duration, id], (err, result) => {
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

// DELETE - מחיקת תרגיל לפי id
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
