const express = require("express");
const router = express.Router();
const db = require("../db");

// פונקציה ליצירת אובייקט הודעה אחיד
function createMessage(type, text) {
  return { type, text };
}

// GET all workouts
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
    res.json(results);
  });
});

// POST - Add new workout with duplicate check
router.post("/", (req, res) => {
  const { workout_date, workout_time } = req.body;

  if (!workout_date || !workout_time) {
    return res.status(400).json(createMessage("error", "חסר תאריך או שעה"));
  }

  const checkQuery = `
    SELECT COUNT(*) AS count 
    FROM workouts 
    WHERE workout_date = ? AND workout_time = ?
  `;
  db.query(checkQuery, [workout_date, workout_time], (err, results) => {
    if (err) {
      console.error("Check workout error:", err);
      return res
        .status(500)
        .json(createMessage("error", "שגיאת שרת בעת בדיקת האימון"));
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

// PUT - Update workout with duplicate time check
router.put("/", (req, res) => {
  const { workout_date, workout_time, new_time } = req.body;

  if (!workout_date || !workout_time || !new_time) {
    return res.status(400).json(createMessage("error", "חסרים נתונים לעדכון"));
  }

  const checkQuery = `
    SELECT COUNT(*) AS count 
    FROM workouts 
    WHERE workout_date = ? AND workout_time = ? 
      AND NOT (workout_date = ? AND workout_time = ?)
  `;
  db.query(
    checkQuery,
    [workout_date, new_time, workout_date, workout_time],
    (err, results) => {
      if (err) {
        console.error("Check workout error:", err);
        return res
          .status(500)
          .json(createMessage("error", "שגיאת שרת בעת בדיקת האימון"));
      }

      if (results[0].count > 0) {
        return res
          .status(409)
          .json({ type: "error", text: "כבר קיים אימון בשעה הזאת" });
      }

      const updateQuery = `UPDATE workouts SET workout_time = ? WHERE workout_date = ? AND workout_time = ?`;
      db.query(
        updateQuery,
        [new_time, workout_date, workout_time],
        (err, result) => {
          if (err) {
            console.error("Update workout error:", err);
            return res
              .status(500)
              .json(createMessage("error", "שגיאה בעדכון האימון"));
          }
          if (result.affectedRows === 0) {
            return res
              .status(404)
              .json(createMessage("error", "האימון לא נמצא"));
          }
          res.json(createMessage("success", "האימון עודכן בהצלחה"));
        }
      );
    }
  );
});

// DELETE - Delete workout
router.delete("/", (req, res) => {
  const { workout_date, workout_time } = req.body;

  if (!workout_date || !workout_time) {
    return res.status(400).json(createMessage("error", "חסר תאריך או שעה"));
  }

  const query = `DELETE FROM workouts WHERE workout_date = ? AND workout_time = ?`;
  db.query(query, [workout_date, workout_time], (err, result) => {
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
