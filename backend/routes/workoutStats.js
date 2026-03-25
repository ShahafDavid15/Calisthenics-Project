const express = require("express");
const router = express.Router();

const workoutStatsRepository = require("../repositories/workoutStatsRepository");
const { WorkoutStatsService } = require("../services/workoutStatsService");
const { WorkoutStatsController } = require("../controllers/workoutStatsController");

const workoutStatsService = new WorkoutStatsService(workoutStatsRepository);
const workoutStatsController = new WorkoutStatsController(workoutStatsService);

const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/exercise-stats",    workoutStatsController.getExerciseStats);
router.get("/general-stats",     workoutStatsController.getGeneralStats);
router.get("/exercise-progress", workoutStatsController.getExerciseProgress);

module.exports = router;
