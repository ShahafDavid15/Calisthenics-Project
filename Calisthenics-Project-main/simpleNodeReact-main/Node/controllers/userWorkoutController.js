const { userWorkoutService, AppError } = require("../services/userWorkoutService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "שגיאת שרת" });
}

class UserWorkoutController {
  async getAll(req, res) {
    try {
      const workouts = await userWorkoutService.getByUserId(req.user.userId);
      return res.json(workouts);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async book(req, res) {
    try {
      const { workout_date, workout_time, membership_name } = req.body;
      const result = await userWorkoutService.book(
        req.user.userId,
        workout_date,
        workout_time,
        membership_name
      );
      return res.status(201).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async cancel(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await userWorkoutService.cancel(id, req.user.userId);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getParticipantCounts(req, res) {
    try {
      const counts = await userWorkoutService.getParticipantCounts();
      return res.json(counts);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = new UserWorkoutController();
