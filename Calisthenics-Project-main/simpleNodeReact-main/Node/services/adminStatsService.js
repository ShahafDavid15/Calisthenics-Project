const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class AdminStatsService {
  async getStats() {
    const [users, memberships, totalWorkouts, popularDay, popularTime, monthlyIncome] =
      await Promise.all([
        query("SELECT COUNT(*) AS total_users FROM users WHERE username <> 'admin'"),
        query(`
          SELECT m.name AS membership_name, COUNT(um.user_id) AS active_count
          FROM membership m
          LEFT JOIN user_membership um
            ON m.membership_id = um.membership_id
           AND CURDATE() BETWEEN um.start_date AND um.end_date
          WHERE um.user_id IS NULL OR um.user_id NOT IN (
            SELECT user_id FROM users WHERE username = 'admin'
          )
          GROUP BY m.name
        `),
        query("SELECT COUNT(*) AS total_workouts FROM user_workouts"),
        query(`
          SELECT workout_date, COUNT(*) AS count
          FROM user_workouts
          GROUP BY workout_date
          ORDER BY count DESC
          LIMIT 1
        `),
        query(`
          SELECT workout_time, COUNT(*) AS count
          FROM user_workouts
          GROUP BY workout_time
          ORDER BY count DESC
          LIMIT 1
        `),
        query(`
          SELECT DATE_FORMAT(um.created_at, '%Y-%m') AS month,
                 SUM(m.price_with_vat) AS total_income
          FROM user_membership AS um
          JOIN membership AS m ON um.membership_id = m.membership_id
          GROUP BY month
          ORDER BY month ASC
        `),
      ]);

    return {
      total_users:       users[0]?.total_users || 0,
      memberships,
      total_workouts:    totalWorkouts[0]?.total_workouts || 0,
      most_popular_day:  popularDay[0]?.workout_date || null,
      most_popular_time: popularTime[0]?.workout_time || null,
      monthly_income:    monthlyIncome,
    };
  }
}

module.exports = new AdminStatsService();
