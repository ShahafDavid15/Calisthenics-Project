/**
 * This module manages CRUD operations for the "workouts" table.
 *
 * Responsibilities:
 * - Retrieve all workouts.
 * - Add a new workout.
 * - Update an existing workout's time.
 * - Remove a workout by ID.
 *
 * Additional functionality:
 * - Validates that no workout is created/updated on Saturday.
 * - Ensures no duplicate workout exists on the same date & time.
 * - Standardized success/error messages returned to client.
 */

const express = require("express");
const router = express.Router();
const db = require("../db");

// create a standardized message object
function createMessage(type, text) {
  return { type, text };
}

// check if a given date is Saturday
function isSaturday(dateStr) {
  const date = new Date(dateStr);
  return date.getDay() === 6;
}

// GET all workouts
// Retrieves all workouts from the database, excluding Saturdays
router.get("/", (req, res) => {
  const query = `
    SELECT workout_id, 
           DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date,
           TIME_FORMAT(workout_time, '%H:%i') AS workout_time
    FROM workouts
    ORDER BY workout_date ASC, workout_time ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("DB error (GET workouts):", err);
      return res.status(500).json(createMessage("error", "שגיאת מסד נתונים"));
    }
    // Filter out workouts scheduled on Saturdays
    const filtered = results.filter((w) => !isSaturday(w.workout_date));
    res.json(filtered);
  });
});

// POST - Add new workout
router.post("/", (req, res) => {
  const { workout_date, workout_time } = req.body;
  if (!workout_date || !workout_time) {
    return res.status(400).json(createMessage("error", "חסר תאריך או שעה"));
  }

  if (isSaturday(workout_date)) {
    return res
      .status(400)
      .json(createMessage("error", "לא ניתן ליצור אימון בשבת"));
  }

  const checkQuery = `
  SELECT COUNT(*) AS count
  FROM user_workouts
  WHERE user_id = ?
  AND YEARWEEK(workout_date, 0) = YEARWEEK(?, 0)
`;

  db.query(checkQuery, [workout_date, workout_time], (err, results) => {
    if (err) {
      console.error("Check workout error:", err);
      return res
        .status(500)
        .json(createMessage("error", "שגיאה בבדיקת כפילות"));
    }
    if (results[0].count > 0) {
      return res
        .status(409)
        .json(createMessage("error", "כבר קיים אימון בשעה הזאת"));
    }

    const insertQuery = `INSERT INTO workouts (workout_date, workout_time) VALUES (?, ?)`;
    db.query(insertQuery, [workout_date, workout_time], (err, result) => {
      if (err) {
        console.error("Insert workout error:", err);
        return res
          .status(500)
          .json(createMessage("error", "שגיאה בהוספת אימון"));
      }
      res.status(201).json(createMessage("success", "האימון נוסף בהצלחה"));
    });
  });
});

// PUT - Update workout time by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { workout_time } = req.body;

  if (!workout_time) {
    return res.status(400).json(createMessage("error", "חסר זמן חדש"));
  }

  // Retrieve the existing date of the workout to validate updates
  const getDateQuery = `SELECT workout_date FROM workouts WHERE workout_id = ?`;
  db.query(getDateQuery, [id], (err, results) => {
    if (err) {
      console.error("Get workout date error:", err);
      return res
        .status(500)
        .json(createMessage("error", "שגיאה בקבלת תאריך האימון"));
    }

    if (results.length === 0) {
      return res.status(404).json(createMessage("error", "האימון לא נמצא"));
    }

    const workout_date = results[0].workout_date;

    if (isSaturday(workout_date)) {
      return res
        .status(400)
        .json(createMessage("error", "לא ניתן לעדכן אימון לשבת"));
    }

    // Check for duplicate time for the same date
    const checkQuery = `
      SELECT COUNT(*) AS count 
      FROM workouts 
      WHERE workout_date = ? AND workout_time = ? AND workout_id != ?
    `;
    db.query(checkQuery, [workout_date, workout_time, id], (err, results) => {
      if (err) {
        console.error("Check workout time error:", err);
        return res
          .status(500)
          .json(createMessage("error", "שגיאה בבדיקת כפילות"));
      }

      if (results[0].count > 0) {
        return res
          .status(409)
          .json(createMessage("error", "כבר קיים אימון בשעה הזאת"));
      }

      // Update workout time only
      const updateQuery = `UPDATE workouts SET workout_time = ? WHERE workout_id = ?`;
      db.query(updateQuery, [workout_time, id], (err, result) => {
        if (err) {
          console.error("Update workout error:", err);
          return res
            .status(500)
            .json(createMessage("error", "שגיאה בעדכון האימון"));
        }
        if (result.affectedRows === 0) {
          return res.status(404).json(createMessage("error", "האימון לא נמצא"));
        }
        res.json(createMessage("success", "האימון עודכן בהצלחה"));
      });
    });
  });
});

// DELETE - Delete workout by ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM workouts WHERE workout_id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Delete workout error:", err);
      return res
        .status(500)
        .json(createMessage("error", "שגיאה במחיקת האימון"));
    }
    if (result.affectedRows === 0) {
      return res.status(404).json(createMessage("error", "האימון לא נמצא"));
    }
    res.json(createMessage("success", "האימון נמחק בהצלחה"));
  });
});

module.exports = router;
