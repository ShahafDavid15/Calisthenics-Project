const { AppError } = require("../services/workoutService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ type: "error", text: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ type: "error", text: "שגיאת שרת" });
}

class WorkoutController {
  constructor(service) {
    this.service = service;
    this.getAll = this.getAll.bind(this);
    this.create = this.create.bind(this);
    this.updateTime = this.updateTime.bind(this);
    this.deleteById = this.deleteById.bind(this);
  }

  async getAll(req, res) {
    try {
      const workouts = await this.service.getAll();
      return res.json(workouts);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async create(req, res) {
    try {
      const { workout_date, workout_time } = req.body;
      const result = await this.service.create(workout_date, workout_time);
      return res.status(201).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updateTime(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { workout_time } = req.body;
      const result = await this.service.updateTime(id, workout_time);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.service.deleteById(id);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = { WorkoutController };
