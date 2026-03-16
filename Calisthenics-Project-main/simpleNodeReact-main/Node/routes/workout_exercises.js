/**
 * Workout-exercise routes – routing only.
 * Business logic → workoutExerciseService
 * DB queries     → workoutExerciseRepository
 */

const express = require("express");
const router = express.Router();
const workoutExerciseController = require("../controllers/workoutExerciseController");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  handleValidation,
  workoutExercisePostValidation,
  workoutExercisePutValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", (req, res) => workoutExerciseController.getAll(req, res));

router.post(
  "/",
  ...workoutExercisePostValidation,
  handleValidation,
  (req, res) => workoutExerciseController.create(req, res)
);

router.put(
  "/:id",
  ...workoutExercisePutValidation,
  handleValidation,
  (req, res) => workoutExerciseController.update(req, res)
);

router.delete(
  "/:id",
  ...idParamValidation,
  handleValidation,
  (req, res) => workoutExerciseController.deleteById(req, res)
);

module.exports = router;
