const workoutRepository = require("../repositories/workoutRepository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function isSaturday(dateStr) {
  return new Date(dateStr).getDay() === 6;
}

class WorkoutService {
  async getAll() {
    const workouts = await workoutRepository.getAll();
    return workouts.filter((w) => !isSaturday(w.workout_date));
  }

  async create(workout_date, workout_time) {
    if (isSaturday(workout_date)) {
      throw new AppError("לא ניתן ליצור אימון בשבת", 400);
    }

    const duplicate = await workoutRepository.existsAtSlot(workout_date, workout_time);
    if (duplicate) {
      throw new AppError("כבר קיים אימון בתאריך ושעה אלה", 409);
    }

    await workoutRepository.create(workout_date, workout_time);
    return { type: "success", text: "האימון נוסף בהצלחה" };
  }

  async updateTime(id, workout_time) {
    const workout = await workoutRepository.findById(id);
    if (!workout) {
      throw new AppError("האימון לא נמצא", 404);
    }

    if (isSaturday(workout.workout_date)) {
      throw new AppError("לא ניתן לעדכן אימון לשבת", 400);
    }

    const duplicate = await workoutRepository.existsAtSlot(
      workout.workout_date,
      workout_time,
      id
    );
    if (duplicate) {
      throw new AppError("כבר קיים אימון בשעה הזאת", 409);
    }

    const result = await workoutRepository.updateTime(id, workout_time);
    if (result.affectedRows === 0) {
      throw new AppError("האימון לא נמצא", 404);
    }
    return { type: "success", text: "האימון עודכן בהצלחה" };
  }

  async deleteById(id) {
    const result = await workoutRepository.deleteById(id);
    if (result.affectedRows === 0) {
      throw new AppError("האימון לא נמצא", 404);
    }
    return { type: "success", text: "האימון נמחק בהצלחה" };
  }
}

module.exports = { workoutService: new WorkoutService(), AppError };
