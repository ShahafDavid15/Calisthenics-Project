const { AppError } = require("../services/userWorkoutService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "שגיאת שרת" });
}

class UserWorkoutController {
  constructor(service) {
    this.service = service;
    this.getAll = this.getAll.bind(this);
    this.book = this.book.bind(this);
    this.cancel = this.cancel.bind(this);
    this.getParticipantCounts = this.getParticipantCounts.bind(this);
  }

  async getAll(req, res) {
    try {
      const workouts = await this.service.getByUserId(req.user.userId);
      return res.json(workouts);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async book(req, res) {
    try {
      const { workout_date, workout_time, membership_name } = req.body;
      const result = await this.service.book(
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
      const result = await this.service.cancel(id, req.user.userId);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getParticipantCounts(req, res) {
    try {
      const counts = await this.service.getParticipantCounts();
      return res.json(counts);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = { UserWorkoutController };
