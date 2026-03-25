const db = require("../db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

class WorkoutExerciseRepository {
  getByUserId(userId) {
    return query(
      `SELECT id, user_id, exercise, repetitions, workout_date
       FROM workout_exercises
       WHERE user_id = ?
       ORDER BY workout_date DESC`,
      [userId]
    );
  }

  create(userId, exercise, repetitions, workout_date) {
    return query(
      "INSERT INTO workout_exercises (user_id, exercise, repetitions, workout_date) VALUES (?, ?, ?, ?)",
      [userId, exercise, repetitions, workout_date]
    );
  }

  update(id, userId, exercise, repetitions, workout_date) {
    return query(
      `UPDATE workout_exercises
       SET exercise = ?, repetitions = ?, workout_date = ?
       WHERE id = ? AND user_id = ?`,
      [exercise, repetitions, workout_date, id, userId]
    );
  }

  deleteById(id, userId) {
    return query(
      "DELETE FROM workout_exercises WHERE id = ? AND user_id = ?",
      [id, userId]
    );
  }
}

module.exports = new WorkoutExerciseRepository();
