const { AppError } = require("../services/workoutExerciseService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "שגיאת שרת" });
}

class WorkoutExerciseController {
  constructor(service) {
    this.service = service;
    this.getAll = this.getAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.deleteById = this.deleteById.bind(this);
  }

  async getAll(req, res) {
    try {
      const exercises = await this.service.getByUserId(req.user.userId);
      return res.json(exercises);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async create(req, res) {
    try {
      const { exercise, repetitions, workout_date } = req.body;
      const result = await this.service.create(req.user.userId, {
        exercise,
        repetitions,
        workout_date,
      });
      return res.status(201).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async update(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { exercise, repetitions, workout_date } = req.body;
      const result = await this.service.update(id, req.user.userId, {
        exercise,
        repetitions,
        workout_date,
      });
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.service.deleteById(id, req.user.userId);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = { WorkoutExerciseController };
