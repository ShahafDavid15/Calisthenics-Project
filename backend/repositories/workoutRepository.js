const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class WorkoutRepository {
  getAll() {
    return query(`
      SELECT workout_id,
             DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date,
             TIME_FORMAT(workout_time, '%H:%i')    AS workout_time
      FROM workouts
      ORDER BY workout_date ASC, workout_time ASC
    `);
  }

  findById(id) {
    return query(
      "SELECT workout_id, workout_date, workout_time FROM workouts WHERE workout_id = ?",
      [id]
    ).then((rows) => rows[0] || null);
  }

  /** Check if a workout already exists at exact date+time (excluding a given id) */
  existsAtSlot(workout_date, workout_time, excludeId = null) {
    const sql = excludeId
      ? "SELECT COUNT(*) AS count FROM workouts WHERE workout_date = ? AND workout_time = ? AND workout_id != ?"
      : "SELECT COUNT(*) AS count FROM workouts WHERE workout_date = ? AND workout_time = ?";
    const params = excludeId
      ? [workout_date, workout_time, excludeId]
      : [workout_date, workout_time];
    return query(sql, params).then((rows) => rows[0].count > 0);
  }

  create(workout_date, workout_time) {
    return query(
      "INSERT INTO workouts (workout_date, workout_time) VALUES (?, ?)",
      [workout_date, workout_time]
    );
  }

  updateTime(id, workout_time) {
    return query(
      "UPDATE workouts SET workout_time = ? WHERE workout_id = ?",
      [workout_time, id]
    );
  }

  deleteById(id) {
    return query("DELETE FROM workouts WHERE workout_id = ?", [id]);
  }
}

module.exports = new WorkoutRepository();
