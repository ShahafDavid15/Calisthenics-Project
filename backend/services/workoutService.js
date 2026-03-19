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
  constructor(repository) {
    this.repository = repository;
  }

  async getAll() {
    const workouts = await this.repository.getAll();
    return workouts.filter((w) => !isSaturday(w.workout_date));
  }

  async create(workout_date, workout_time) {
    if (isSaturday(workout_date)) {
      throw new AppError("לא ניתן ליצור אימון בשבת", 400);
    }

    const duplicate = await this.repository.existsAtSlot(workout_date, workout_time);
    if (duplicate) {
      throw new AppError("כבר קיים אימון בתאריך ושעה אלה", 409);
    }

    await this.repository.create(workout_date, workout_time);
    return { type: "success", text: "האימון נוסף בהצלחה" };
  }

  async updateTime(id, workout_time) {
    const workout = await this.repository.findById(id);
    if (!workout) {
      throw new AppError("האימון לא נמצא", 404);
    }

    if (isSaturday(workout.workout_date)) {
      throw new AppError("לא ניתן לעדכן אימון לשבת", 400);
    }

    const duplicate = await this.repository.existsAtSlot(
      workout.workout_date,
      workout_time,
      id
    );
    if (duplicate) {
      throw new AppError("כבר קיים אימון בשעה הזאת", 409);
    }

    const result = await this.repository.updateTime(id, workout_time);
    if (result.affectedRows === 0) {
      throw new AppError("האימון לא נמצא", 404);
    }
    return { type: "success", text: "האימון עודכן בהצלחה" };
  }

  async deleteById(id) {
    const result = await this.repository.deleteById(id);
    if (result.affectedRows === 0) {
      throw new AppError("האימון לא נמצא", 404);
    }
    return { type: "success", text: "האימון נמחק בהצלחה" };
  }
}

module.exports = { WorkoutService, AppError };
