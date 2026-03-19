const express = require("express");
const router = express.Router();

const workoutExerciseRepository = require("../repositories/workoutExerciseRepository");
const userWorkoutRepository = require("../repositories/userWorkoutRepository");
const { WorkoutExerciseService } = require("../services/workoutExerciseService");
const { WorkoutExerciseController } = require("../controllers/workoutExerciseController");

const workoutExerciseService = new WorkoutExerciseService(workoutExerciseRepository, userWorkoutRepository);
const workoutExerciseController = new WorkoutExerciseController(workoutExerciseService);

const { authMiddleware } = require("../middleware/authMiddleware");
const {
  handleValidation,
  workoutExercisePostValidation,
  workoutExercisePutValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", workoutExerciseController.getAll);
router.get("/registered-dates", workoutExerciseController.getRegisteredDates);

router.post(
  "/",
  ...workoutExercisePostValidation,
  handleValidation,
  workoutExerciseController.create
);

router.put(
  "/:id",
  ...workoutExercisePutValidation,
  handleValidation,
  workoutExerciseController.update
);

router.delete(
  "/:id",
  ...idParamValidation,
  handleValidation,
  workoutExerciseController.deleteById
);

module.exports = router;
