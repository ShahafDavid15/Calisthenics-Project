const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class AdminStatsRepository {
  getUserCount() {
    return query("SELECT COUNT(*) AS total_users FROM users WHERE username <> 'admin'");
  }

  getMembershipDistribution() {
    return query(`
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
  }

  getTotalWorkouts() {
    return query("SELECT COUNT(*) AS total_workouts FROM user_workouts");
  }

  getMostPopularDay() {
    return query(`
      SELECT workout_date, COUNT(*) AS count
      FROM user_workouts
      GROUP BY workout_date
      ORDER BY count DESC
      LIMIT 1
    `);
  }

  getMostPopularTime() {
    return query(`
      SELECT workout_time, COUNT(*) AS count
      FROM user_workouts
      GROUP BY workout_time
      ORDER BY count DESC
      LIMIT 1
    `);
  }

  getMonthlyIncome() {
    return query(`
      SELECT DATE_FORMAT(um.created_at, '%Y-%m') AS month,
             SUM(m.price_with_vat) AS total_income
      FROM user_membership AS um
      JOIN membership AS m ON um.membership_id = m.membership_id
      GROUP BY month
      ORDER BY month ASC
    `);
  }
}

module.exports = new AdminStatsRepository();
