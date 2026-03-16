/**
 * User-workout booking routes – routing only.
 * Business logic → userWorkoutService
 * DB queries     → userWorkoutRepository
 */

const express = require("express");
const router = express.Router();
const userWorkoutController = require("../controllers/userWorkoutController");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  handleValidation,
  userWorkoutPostValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", (req, res) => userWorkoutController.getAll(req, res));

router.get("/all-participants", (req, res) =>
  userWorkoutController.getParticipantCounts(req, res)
);

router.post(
  "/",
  ...userWorkoutPostValidation,
  handleValidation,
  (req, res) => userWorkoutController.book(req, res)
);

router.delete(
  "/:id",
  ...idParamValidation,
  handleValidation,
  (req, res) => userWorkoutController.cancel(req, res)
);

module.exports = router;
