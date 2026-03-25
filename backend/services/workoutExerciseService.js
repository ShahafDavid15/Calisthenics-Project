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
  constructor(repository, userWorkoutRepository) {
    this.repository = repository;
    this.userWorkoutRepository = userWorkoutRepository;
  }

  async getByUserId(userId) {
    return this.repository.getByUserId(userId);
  }

  async getPastRegisteredDates(userId) {
    return this.userWorkoutRepository.getPastDates(userId);
  }

  /**
   * Ensures the user booked a slot on workout_date and that slot has ended (per DB rules).
   */
  async assertCanLogExercises(userId, workout_date) {
    const registered = await this.userWorkoutRepository.existsOnDay(userId, workout_date);
    if (!registered) {
      throw new AppError("לא נרשמת לאימון זה", 400);
    }
    const ended = await this.userWorkoutRepository.hasEndedOnDay(userId, workout_date);
    if (!ended) {
      throw new AppError(
        "האימון עדיין לא הסתיים. ניתן להזין נתונים שעה לאחר שעת תחילת האימון שבו נרשמת.",
        400
      );
    }
  }

  async create(userId, { exercise, repetitions, workout_date }) {
    if (isFutureDate(workout_date)) {
      throw new AppError("לא ניתן להוסיף אימון בעתיד", 400);
    }

    await this.assertCanLogExercises(userId, workout_date);

    const result = await this.repository.create(userId, exercise, repetitions, workout_date);
    return { message: "התרגיל נוסף בהצלחה", id: result.insertId };
  }

  async update(id, userId, { exercise, repetitions, workout_date }) {
    if (isFutureDate(workout_date)) {
      throw new AppError("לא ניתן לעדכן אימון לעתיד", 400);
    }

    await this.assertCanLogExercises(userId, workout_date);

    const result = await this.repository.update(id, userId, exercise, repetitions, workout_date);

    if (result.affectedRows === 0) {
      throw new AppError("התרגיל לא נמצא", 404);
    }
    return { message: "התרגיל עודכן בהצלחה" };
  }

  async deleteById(id, userId) {
    const result = await this.repository.deleteById(id, userId);
    if (result.affectedRows === 0) {
      throw new AppError("התרגיל לא נמצא", 404);
    }
    return { message: "התרגיל נמחק בהצלחה" };
  }
}

module.exports = { WorkoutExerciseService, AppError };
