const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class WorkoutStatsRepository {
  getExerciseStats(userId, month) {
    let sql = `
      SELECT exercise,
             COUNT(*)                             AS total_sessions,
             SUM(repetitions)                     AS total_repetitions,
             ROUND(SUM(repetitions)/COUNT(*), 2)  AS avg_repetitions
      FROM workout_exercises
      WHERE user_id = ?
    `;
    const params = [userId];

    if (month) {
      sql += " AND MONTH(workout_date) = ?";
      params.push(month);
    }

    sql += " GROUP BY exercise ORDER BY total_sessions DESC";
    return query(sql, params);
  }

  getGeneralStats() {
    return query(
      "SELECT COUNT(*) AS total_exercises, SUM(repetitions) AS total_repetitions FROM workout_exercises"
    );
  }
}

module.exports = new WorkoutStatsRepository();
