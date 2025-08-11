const express = require("express");
const router = express.Router();
const db = require("../db");

// GET user workouts by user_id
router.get("/", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const query = `
    SELECT 
      id, 
      DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date,
      TIME_FORMAT(workout_time, '%H:%i') AS workout_time
    FROM user_workouts
    WHERE user_id = ?
    ORDER BY workout_date ASC, workout_time ASC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user workouts:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
});

// POST - Register a new workout booking
router.post("/", (req, res) => {
  const { user_id, workout_date, workout_time } = req.body;
  if (!user_id || !workout_date || !workout_time) {
    return res
      .status(400)
      .json({ error: "Missing user_id, workout_date or workout_time" });
  }

  // Check if user already booked a workout on the same date
  const checkQuery = `
    SELECT COUNT(*) AS count FROM user_workouts
    WHERE user_id = ? AND workout_date = ?
  `;

  db.query(checkQuery, [user_id, workout_date], (err, results) => {
    if (err) {
      console.error("DB error checking existing workout:", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (results[0].count > 0) {
      return res
        .status(409)
        .json({ error: "User already booked a workout this day" });
    }

    // Insert new booking
    const insertQuery = `
      INSERT INTO user_workouts (user_id, workout_date, workout_time)
      VALUES (?, ?, ?)
    `;

    db.query(
      insertQuery,
      [user_id, workout_date, workout_time],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(409)
              .json({ error: "Already registered for this workout" });
          }
          console.error("Insert error:", err);
          return res.status(500).json({ error: "Insert error" });
        }
        res.status(201).json({
          message: "Workout booked successfully",
          id: result.insertId,
        });
      }
    );
  });
});

// DELETE - Cancel a workout booking by id (from URL param)
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  const query = `DELETE FROM user_workouts WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Delete error" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Workout not found or already canceled" });
    }

    res.json({ message: "Workout canceled successfully" });
  });
});

// GET all participants counts grouped by workout_date and workout_time
router.get("/all-participants", (req, res) => {
  const query = `
    SELECT 
      workout_date, 
      TIME_FORMAT(workout_time, '%H:%i') AS workout_time,
      COUNT(*) AS participant_count
    FROM user_workouts
    GROUP BY workout_date, workout_time
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching participants counts:", err);
      return res.status(500).json({ error: "DB error" });
    }

    const counts = {};
    results.forEach(({ workout_date, workout_time, participant_count }) => {
      counts[`${workout_date}|${workout_time}`] = participant_count;
    });

    res.json(counts);
  });
});

module.exports = router;
