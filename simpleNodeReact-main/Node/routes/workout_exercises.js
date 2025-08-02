const express = require("express");
const router = express.Router();
const db = require("../db");

// POST - Add a new workout exercise
// Validates request body and inserts new exercise record into the database
router.post("/", (req, res) => {
  const { exercise, repetitions, duration } = req.body;

  // Check that all required fields are provided
  if (!exercise || !repetitions || !duration) {
    return res.status(400).json({ error: "נא למלא את כל השדות" });
  }

  const query = `
    INSERT INTO workout_exercises (exercise, repetitions, duration)
    VALUES (?, ?, ?)
  `;

  // Execute insert query
  db.query(query, [exercise, repetitions, duration], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "שגיאה בשמירת התרגיל" });
    }

    // Respond with success message and inserted record ID
    res
      .status(201)
      .json({ message: "התרגיל נשמר בהצלחה", id: result.insertId });
  });
});

// GET - Retrieve all workout exercises
// Returns list of exercises ordered by creation date
router.get("/", (req, res) => {
  const query = `
    SELECT id, exercise, repetitions, duration, created_at
    FROM workout_exercises
    ORDER BY created_at DESC
  `;

  // Execute select query
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "שגיאה בשליפת התרגילים" });
    }

    // Return the results as JSON
    res.json(results);
  });
});

// PUT - Update an existing workout exercise by ID
// Validates input and updates the record if found
router.put("/:id", (req, res) => {
  const workoutId = req.params.id;
  const { exercise, repetitions, duration } = req.body;

  // Validate required fields
  if (!exercise || !repetitions || !duration) {
    return res.status(400).json({ error: "נא למלא את כל השדות" });
  }

  const query = `
    UPDATE workout_exercises 
    SET exercise = ?, repetitions = ?, duration = ?
    WHERE id = ?
  `;

  // Execute update query
  db.query(
    query,
    [exercise, repetitions, duration, workoutId],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "שגיאה בעדכון התרגיל" });
      }
      // If no rows affected, the record was not found
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "תרגיל לא נמצא" });
      }
      // Return success message
      res.json({ message: "התרגיל עודכן בהצלחה" });
    }
  );
});

// DELETE - Remove a workout exercise by ID
// Deletes the record if found
router.delete("/:id", (req, res) => {
  const workoutId = req.params.id;

  const query = `
    DELETE FROM workout_exercises
    WHERE id = ?
  `;

  // Execute delete query
  db.query(query, [workoutId], (err, result) => {
    if (err) return res.status(500).json({ error: "שגיאה במחיקה מהמסד" });
    // If no rows affected, the record was not found
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "תרגיל לא נמצא" });
    }
    // Return success message
    res.json({ message: "נמחק בהצלחה" });
  });
});

module.exports = router;
