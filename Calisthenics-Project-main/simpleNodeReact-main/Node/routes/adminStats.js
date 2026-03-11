/**
 * Admin statistics module.
 *  total users.
 *  active memberships by type.
 *  total workout registrations.
 *  most popular workout day and time.
 *  monthly income from memberships.
 */

const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");

// wrap db.query in a Promise
const query = (sql, params) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

// GET /api/admin-stats (admin only)
router.get("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    // Count total users (excluding admin)
    const users = await query(
      "SELECT COUNT(*) AS total_users FROM users WHERE username <> 'admin'"
    );

    // Count active memberships by type
    const memberships = await query(`
      SELECT m.name AS membership_name, COUNT(um.user_id) AS active_count
      FROM membership m
      LEFT JOIN user_membership um 
        ON m.membership_id = um.membership_id 
       AND CURDATE() BETWEEN um.start_date AND um.end_date
      WHERE um.user_id IS NULL OR um.user_id NOT IN (
        SELECT user_id FROM users WHERE username = 'admin'
      )
      GROUP BY m.name
    `);

    // Count total workouts registrations
    const totalWorkouts = await query(
      "SELECT COUNT(*) AS total_workouts FROM user_workouts"
    );

    // Find most popular workout day
    const popularDay = await query(`
      SELECT workout_date, COUNT(*) AS count
      FROM user_workouts
      GROUP BY workout_date
      ORDER BY count DESC
      LIMIT 1
    `);

    // Find most popular workout time
    const popularTime = await query(`
      SELECT workout_time, COUNT(*) AS count
      FROM user_workouts
      GROUP BY workout_time
      ORDER BY count DESC
      LIMIT 1
    `);

    // Monthly income from user_membership
    const monthlyIncome = await query(`
      SELECT 
        DATE_FORMAT(um.created_at, '%Y-%m') AS month,
        SUM(m.price_with_vat) AS total_income
      FROM user_membership AS um
      JOIN membership AS m ON um.membership_id = m.membership_id
      GROUP BY month
      ORDER BY month ASC
      `);

    res.json({
      total_users: users[0]?.total_users || 0,
      memberships,
      total_workouts: totalWorkouts[0]?.total_workouts || 0,
      most_popular_day: popularDay[0]?.workout_date || null,
      most_popular_time: popularTime[0]?.workout_time || null,
      monthly_income: monthlyIncome,
    });
  } catch (err) {
    console.error("Fetch admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

module.exports = router;
