/**
 * Workout statistics routes – routing only.
 * Business logic → workoutStatsService
 */

const express = require("express");
const router = express.Router();
const workoutStatsController = require("../controllers/workoutStatsController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/exercise-stats", (req, res) =>
  workoutStatsController.getExerciseStats(req, res)
);

router.get("/general-stats", (req, res) =>
  workoutStatsController.getGeneralStats(req, res)
);

module.exports = router;
