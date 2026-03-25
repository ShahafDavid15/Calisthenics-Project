/**
 * This module seeds the database with default workout slots.
 * Generates a schedule for the next 7 days, skipping Saturdays.
 * Uses special hours for Fridays, default hours for other days.
 * Checks the database to avoid duplicate entries.
 * Inserts new workouts into the `workouts` table if they do not already exist.
 */

const db = require("../db");

// Default workout hours for most days
const defaultHours = ["17:00", "18:00", "19:00", "20:00"];

// Workout hours for Fridays (day 5)
const fridayHours = ["10:00", "11:00", "12:00"];

// Number of days to schedule workouts for (starting from today)
const daysToAdd = 7;

/**
 * Generates an array of dates with available workout times
 * Skips Saturdays (day 6)
 * Uses different hours for Fridays
 * @returns {Array} Array of objects with { date: "YYYY-MM-DD", time: "HH:mm" }
 */
function getScheduleDates() {
  const schedule = [];
  const today = new Date();

  for (let i = 0; i < daysToAdd; i++) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() + i);

    const day = dateObj.getDay();
    // Skip Saturday
    if (day === 6) continue;

    // Format date as YYYY-MM-DD
    const date = dateObj.toISOString().split("T")[0];

    // Use Friday hours or default hours based on the day
    const hours = day === 5 ? fridayHours : defaultHours;

    // Add each time slot for the date
    hours.forEach((time) => {
      schedule.push({ date, time });
    });
  }

  return schedule;
}

/**
 * Removes evening slots that wrongly exist on Fridays (e.g. from legacy schema.sql demo data).
 * MySQL DAYOFWEEK: 1=Sunday … 6=Friday, 7=Saturday.
 */
function deleteFridayEveningSlots(callback) {
  const sql = `
    DELETE FROM workouts
    WHERE DAYOFWEEK(workout_date) = 6
      AND workout_time IN ('17:00:00', '18:00:00', '19:00:00', '20:00:00')
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Friday slot cleanup error:", err);
    } else if (result.affectedRows > 0) {
      console.log(`Removed ${result.affectedRows} incorrect Friday evening workout slot(s).`);
    }
    callback();
  });
}

/**
 * Inserts workouts into the database for the next 7 days if they don't already exist
 * Checks for duplicates before inserting
 */
function insertWorkouts() {
  deleteFridayEveningSlots(() => {
  const schedule = getScheduleDates();

  const checkQuery = `SELECT * FROM workouts WHERE workout_date = ? AND workout_time = ?`;
  const insertQuery = `INSERT INTO workouts (workout_date, workout_time) VALUES (?, ?)`;

  // For each date/time pair check if it exists, then insert if not found
  schedule.forEach(({ date, time }) => {
    db.query(checkQuery, [date, time], (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return;
      }

      if (results.length === 0) {
        db.query(insertQuery, [date, time], (err2) => {
          if (err2) {
            console.error("Insert error:", err2);
            return;
          }
          console.log(`Workout added: ${date} ${time}`);
        });
      }
    });
  });
  });
}

module.exports = insertWorkouts;
