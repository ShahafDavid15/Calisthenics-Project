const workoutExerciseRepository = require("../repositories/workoutExerciseRepository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function isFutureDate(dateStr) {
  const today = new Date().toISOString().split("T")[0];
  return dateStr > today;
}

class WorkoutExerciseService {
  async getByUserId(userId) {
    return workoutExerciseRepository.getByUserId(userId);
  }

  async create(userId, { exercise, repetitions, workout_date }) {
    if (isFutureDate(workout_date)) {
      throw new AppError("לא ניתן להוסיף אימון בעתיד", 400);
    }

    const result = await workoutExerciseRepository.create(
      userId,
      exercise,
      repetitions,
      workout_date
    );
    return { message: "התרגיל נוסף בהצלחה", id: result.insertId };
  }

  async update(id, userId, { exercise, repetitions, workout_date }) {
    if (isFutureDate(workout_date)) {
      throw new AppError("לא ניתן לעדכן אימון לעתיד", 400);
    }

    const result = await workoutExerciseRepository.update(
      id,
      userId,
      exercise,
      repetitions,
      workout_date
    );

    if (result.affectedRows === 0) {
      throw new AppError("התרגיל לא נמצא", 404);
    }
    return { message: "התרגיל עודכן בהצלחה" };
  }

  async deleteById(id, userId) {
    const result = await workoutExerciseRepository.deleteById(id, userId);
    if (result.affectedRows === 0) {
      throw new AppError("התרגיל לא נמצא", 404);
    }
    return { message: "התרגיל נמחק בהצלחה" };
  }
}

module.exports = { workoutExerciseService: new WorkoutExerciseService(), AppError };
