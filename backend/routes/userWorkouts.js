const express = require("express");
const router = express.Router();

const userWorkoutRepository = require("../repositories/userWorkoutRepository");
const { UserWorkoutService } = require("../services/userWorkoutService");
const { UserWorkoutController } = require("../controllers/userWorkoutController");

const userWorkoutService = new UserWorkoutService(userWorkoutRepository);
const userWorkoutController = new UserWorkoutController(userWorkoutService);

const { authMiddleware } = require("../middleware/authMiddleware");
const {
  handleValidation,
  userWorkoutPostValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", userWorkoutController.getAll);
router.get("/all-participants", userWorkoutController.getParticipantCounts);

router.post(
  "/",
  ...userWorkoutPostValidation,
  handleValidation,
  userWorkoutController.book
);

router.delete(
  "/:id",
  ...idParamValidation,
  handleValidation,
  userWorkoutController.cancel
);

module.exports = router;
