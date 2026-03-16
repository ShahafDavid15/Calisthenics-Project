/**
 * Workout routes – routing only.
 * Business logic → workoutService
 * DB queries     → workoutRepository
 */

const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController");
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
const {
  handleValidation,
  workoutPostValidation,
  workoutPutValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", (req, res) => workoutController.getAll(req, res));

router.post(
  "/",
  requireAdmin,
  ...workoutPostValidation,
  handleValidation,
  (req, res) => workoutController.create(req, res)
);

router.put(
  "/:id",
  requireAdmin,
  ...workoutPutValidation,
  handleValidation,
  (req, res) => workoutController.updateTime(req, res)
);

router.delete(
  "/:id",
  requireAdmin,
  ...idParamValidation,
  handleValidation,
  (req, res) => workoutController.deleteById(req, res)
);

module.exports = router;
