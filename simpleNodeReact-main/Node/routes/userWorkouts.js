/**
 * This module Manages workout bookings for users.
 * - fetches all workouts for a user
 * - books a new workout with membership checks
 * - DELETE a workout by ID
 * - GET all-participants returns participant counts per workout
 *
 * Validations include:
 * - One workout per day per user
 * - Max workouts per week according to membership
 * - Prevent duplicate bookings for the same slot
 */

const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 GET all workouts booked by a specific user
 */
router.get("/", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "Missing user_id" });

  const query = `
    SELECT id, 
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

/**
 POST a new workout booking 
 */
router.post("/", async (req, res) => {
  const { user_id, workout_date, workout_time, membership_name } = req.body;

  if (!user_id || !workout_date || !workout_time || !membership_name) {
    return res.status(400).json({
      error: "Missing user_id, workout_date, workout_time or membership_name",
    });
  }

  try {
    // Check if the user is already registered for this exact slot
    const slotQuery = `
      SELECT COUNT(*) AS count
      FROM user_workouts
      WHERE user_id = ? AND workout_date = ? AND workout_time = ?
    `;
    const [slotResult] = await new Promise((resolve, reject) =>
      db.query(
        slotQuery,
        [user_id, workout_date, workout_time],
        (err, results) => (err ? reject(err) : resolve(results))
      )
    );

    if (slotResult.count > 0) {
      return res
        .status(409)
        .json({ error: "Already registered for this workout slot" });
    }

    // Check if user already has a workout on the same day
    const dayQuery = `
      SELECT COUNT(*) AS count
      FROM user_workouts
      WHERE user_id = ? AND workout_date = ?
    `;
    const [dayResult] = await new Promise((resolve, reject) =>
      db.query(dayQuery, [user_id, workout_date], (err, results) =>
        err ? reject(err) : resolve(results)
      )
    );

    if (dayResult.count > 0) {
      return res
        .status(409)
        .json({ error: "Cannot register more than one workout per day" });
    }

    // Determine max workouts per week based on membership
    let maxWorkouts = 3; // default Premium
    const membership = membership_name.trim().toLowerCase();
    if (membership === "basic") maxWorkouts = 1;
    else if (membership === "standard") maxWorkouts = 2;

    // Check how many workouts user already has this week
    const weekQuery = `
      SELECT COUNT(*) AS count
      FROM user_workouts
      WHERE user_id = ?
        AND YEARWEEK(workout_date, 1) = YEARWEEK(?, 1)
    `;
    const [weekResult] = await new Promise((resolve, reject) =>
      db.query(weekQuery, [user_id, workout_date], (err, results) =>
        err ? reject(err) : resolve(results)
      )
    );

    console.log("Weekly check:", {
      user_id,
      workout_date,
      countThisWeek: weekResult.count,
      maxWorkouts,
    });

    if (weekResult.count >= maxWorkouts) {
      return res.status(409).json({
        error: `Cannot register for more than ${maxWorkouts} workouts per week for your membership`,
      });
    }

    // Insert the new workout
    const insertQuery = `
      INSERT INTO user_workouts (user_id, workout_date, workout_time)
      VALUES (?, ?, ?)
    `;
    db.query(
      insertQuery,
      [user_id, workout_date, workout_time],
      (err, result) => {
        if (err) {
          console.error("Insert error:", err);
          return res.status(500).json({ error: "Insert error" });
        }

        res.status(201).json({
          message: "Workout booked successfully",
          id: result.insertId,
        });
      }
    );
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE a workout booking by its ID
 */
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Missing id" });

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

/**
 * GET participant counts for all workouts
 * Returns object keyed by "YYYY-MM-DD|HH:mm"
 */
router.get("/all-participants", (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date,
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
