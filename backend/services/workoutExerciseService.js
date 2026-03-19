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

  async create(userId, { exercise, repetitions, workout_date }) {
    if (isFutureDate(workout_date)) {
      throw new AppError("לא ניתן להוסיף אימון בעתיד", 400);
    }

    const canLog = await this.userWorkoutRepository.hasEndedOnDay(userId, workout_date);
    if (!canLog) {
      throw new AppError("ניתן להזין נתוני אימון רק לאחר סיום האימון", 400);
    }

    const result = await this.repository.create(userId, exercise, repetitions, workout_date);
    return { message: "התרגיל נוסף בהצלחה", id: result.insertId };
  }

  async update(id, userId, { exercise, repetitions, workout_date }) {
    if (isFutureDate(workout_date)) {
      throw new AppError("לא ניתן לעדכן אימון לעתיד", 400);
    }

    const canLog = await this.userWorkoutRepository.hasEndedOnDay(userId, workout_date);
    if (!canLog) {
      throw new AppError("ניתן להזין נתוני אימון רק לאחר סיום האימון", 400);
    }

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
