const express = require("express");
const router = express.Router();
const db = require("../db"); // הקובץ שמכיל את ההגדרות והחיבור למסד הנתונים

// POST /api/workouts
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

module.exports = router;
