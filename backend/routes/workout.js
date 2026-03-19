const express = require("express");
const router = express.Router();

const workoutRepository = require("../repositories/workoutRepository");
const { WorkoutService } = require("../services/workoutService");
const { WorkoutController } = require("../controllers/workoutController");

const workoutService = new WorkoutService(workoutRepository);
const workoutController = new WorkoutController(workoutService);

const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
const {
  handleValidation,
  workoutPostValidation,
  workoutPutValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", workoutController.getAll);

router.post(
  "/",
  requireAdmin,
  ...workoutPostValidation,
  handleValidation,
  workoutController.create
);

router.put(
  "/:id",
  requireAdmin,
  ...workoutPutValidation,
  handleValidation,
  workoutController.updateTime
);

router.delete(
  "/:id",
  requireAdmin,
  ...idParamValidation,
  handleValidation,
  workoutController.deleteById
);

module.exports = router;
