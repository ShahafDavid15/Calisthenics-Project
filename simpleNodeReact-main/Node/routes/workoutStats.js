const express = require("express");
const router = express.Router();
const db = require("../db");

/* GET exercise-statsReturns exercise statistics for a specific user. */
router.get("/exercise-stats", (req, res) => {
  const { user_id, month } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  // Base query
  let query = `
    SELECT exercise, 
           COUNT(*) AS total_sessions,
           SUM(repetitions) AS total_repetitions,
           ROUND(SUM(repetitions)/COUNT(*), 2) AS avg_repetitions
    FROM workout_exercises
    WHERE user_id = ?
  `;
  const params = [user_id];

  // Add month filter if provided
  if (month) {
    query += " AND MONTH(workout_date) = ?";
    params.push(month);
  }

  // Group by exercise and order by most sessions
  query += " GROUP BY exercise ORDER BY total_sessions DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching user stats:", err);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
    res.json(results);
  });
});

/* GET general-stats */
router.get("/general-stats", (req, res) => {
  const query = `
    SELECT COUNT(*) AS total_exercises,
           SUM(repetitions) AS total_repetitions
    FROM workout_exercises
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching general stats:", err);
      return res.status(500).json({ error: "Failed to fetch general stats" });
    }
    res.json(results[0]);
  });
});

module.exports = router;
