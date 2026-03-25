const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class UserWorkoutRepository {
  getByUserId(userId) {
    return query(
      `SELECT id,
              DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date,
              TIME_FORMAT(workout_time, '%H:%i')    AS workout_time
       FROM user_workouts
       WHERE user_id = ?
       ORDER BY workout_date ASC, workout_time ASC`,
      [userId]
    );
  }

  existsAtSlot(userId, workout_date, workout_time) {
    return query(
      "SELECT COUNT(*) AS count FROM user_workouts WHERE user_id = ? AND workout_date = ? AND workout_time = ?",
      [userId, workout_date, workout_time]
    ).then((rows) => rows[0].count > 0);
  }

  existsOnDay(userId, workout_date) {
    return query(
      "SELECT COUNT(*) AS count FROM user_workouts WHERE user_id = ? AND workout_date = ?",
      [userId, workout_date]
    ).then((rows) => rows[0].count > 0);
  }

  hasEndedOnDay(userId, workout_date) {
    return query(
      `SELECT COUNT(*) AS count
       FROM user_workouts
       WHERE user_id = ?
         AND workout_date = ?
         AND (
           workout_date < CURDATE()
           OR (workout_date = CURDATE() AND ADDTIME(workout_time, '01:00:00') <= CURTIME())
         )`,
      [userId, workout_date]
    ).then((rows) => rows[0].count > 0);
  }

  countThisWeek(userId, workout_date) {
    return query(
      `SELECT COUNT(*) AS count
       FROM user_workouts
       WHERE user_id = ? AND YEARWEEK(workout_date, 1) = YEARWEEK(?, 1)`,
      [userId, workout_date]
    ).then((rows) => rows[0].count);
  }

  create(userId, workout_date, workout_time) {
    return query(
      "INSERT INTO user_workouts (user_id, workout_date, workout_time) VALUES (?, ?, ?)",
      [userId, workout_date, workout_time]
    );
  }

  deleteById(id, userId) {
    return query(
      "DELETE FROM user_workouts WHERE id = ? AND user_id = ?",
      [id, userId]
    );
  }

  getPastDates(userId) {
    return query(
      `SELECT DISTINCT DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date
       FROM user_workouts
       WHERE user_id = ? AND workout_date <= CURDATE()
       ORDER BY workout_date DESC`,
      [userId]
    );
  }

  getParticipantCounts() {
    return query(`
      SELECT DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date,
             TIME_FORMAT(workout_time, '%H:%i')    AS workout_time,
             COUNT(*) AS participant_count
      FROM user_workouts
      GROUP BY workout_date, workout_time
    `);
  }

  /** Users with profile email registered for this date+time (for admin time-change notifications). */
  findUsersBookedAtSlot(workoutDateYmd, hhmm) {
    return query(
      `SELECT DISTINCT u.email, u.first_name
       FROM user_workouts uw
       INNER JOIN users u ON u.user_id = uw.user_id
       WHERE uw.workout_date = ?
         AND TIME_FORMAT(uw.workout_time, '%H:%i') = ?
         AND u.email IS NOT NULL
         AND TRIM(u.email) <> ''`,
      [workoutDateYmd, hhmm]
    );
  }
}

module.exports = new UserWorkoutRepository();
