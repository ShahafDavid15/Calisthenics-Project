const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const { exercise, repetitions, duration } = req.body;

  if (!exercise || !repetitions || !duration) {
    return res.status(400).json({ error: "נא למלא את כל השדות" });
  }

  const query = `
    INSERT INTO workout_exercises (exercise, repetitions, duration)
    VALUES (?, ?, ?)
  `;

  db.query(query, [exercise, repetitions, duration], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "שגיאה בשמירת התרגיל" });
    }

    res
      .status(201)
      .json({ message: "התרגיל נשמר בהצלחה", id: result.insertId });
  });
});

router.get("/", (req, res) => {
  const query = `
    SELECT id, exercise, repetitions, duration, created_at
    FROM workout_exercises
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "שגיאה בשליפת התרגילים" });
    }

    res.json(results);
  });
});

router.put("/:id", (req, res) => {
  const workoutId = req.params.id;
  const { exercise, repetitions, duration } = req.body;

  if (!exercise || !repetitions || !duration) {
    return res.status(400).json({ error: "נא למלא את כל השדות" });
  }

  const query = `
    UPDATE workout_exercises 
    SET exercise = ?, repetitions = ?, duration = ?
    WHERE id = ?
  `;

  db.query(query, [exercise, repetitions, duration, workoutId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "שגיאה בעדכון התרגיל" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "תרגיל לא נמצא" });
    }
    res.json({ message: "התרגיל עודכן בהצלחה" });
  });
});

router.delete("/:id", (req, res) => {
  const workoutId = req.params.id;

  const query = `
    DELETE FROM workout_exercises
    WHERE id = ?
  `;

  db.query(query, [workoutId], (err, result) => {
    if (err) return res.status(500).json({ error: "שגיאה במחיקה מהמסד" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "תרגיל לא נמצא" });
    }
    res.json({ message: "נמחק בהצלחה" });
  });
});

module.exports = router;