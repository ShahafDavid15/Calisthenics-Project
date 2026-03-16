const userWorkoutRepository = require("../repositories/userWorkoutRepository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Max workouts per week by membership type */
function getMaxWorkouts(membership_name) {
  switch (membership_name.trim().toLowerCase()) {
    case "basic":    return 1;
    case "standard": return 2;
    default:         return 3; // Premium
  }
}

class UserWorkoutService {
  async getByUserId(userId) {
    return userWorkoutRepository.getByUserId(userId);
  }

  async book(userId, workout_date, workout_time, membership_name) {
    const slotTaken = await userWorkoutRepository.existsAtSlot(userId, workout_date, workout_time);
    if (slotTaken) {
      throw new AppError("כבר רשום לאימון בשעה זו", 409);
    }

    const dayTaken = await userWorkoutRepository.existsOnDay(userId, workout_date);
    if (dayTaken) {
      throw new AppError("לא ניתן להירשם ליותר מאימון אחד ביום", 409);
    }

    const maxWorkouts = getMaxWorkouts(membership_name);
    const weekCount = await userWorkoutRepository.countThisWeek(userId, workout_date);

    if (weekCount >= maxWorkouts) {
      throw new AppError(
        `לא ניתן להירשם ליותר מ-${maxWorkouts} אימונים בשבוע עם המנוי הנוכחי`,
        409
      );
    }

    const result = await userWorkoutRepository.create(userId, workout_date, workout_time);
    return { message: "הרשמה לאימון בוצעה בהצלחה", id: result.insertId };
  }

  async cancel(id, userId) {
    const result = await userWorkoutRepository.deleteById(id, userId);
    if (result.affectedRows === 0) {
      throw new AppError("האימון לא נמצא או כבר בוטל", 404);
    }
    return { message: "האימון בוטל בהצלחה" };
  }

  async getParticipantCounts() {
    const rows = await userWorkoutRepository.getParticipantCounts();
    const counts = {};
    rows.forEach(({ workout_date, workout_time, participant_count }) => {
      counts[`${workout_date}|${workout_time}`] = participant_count;
    });
    return counts;
  }
}

module.exports = { userWorkoutService: new UserWorkoutService(), AppError };
