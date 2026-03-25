const express = require("express");
const router = express.Router();

const membershipRepository = require("../repositories/membershipRepository");
const { MembershipService } = require("../services/membershipService");
const { MembershipController } = require("../controllers/membershipController");

const membershipService = new MembershipService(membershipRepository);
const membershipController = new MembershipController(membershipService);

const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
const {
  handleValidation,
  membershipPostValidation,
  membershipPutValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", membershipController.getAll);

router.post(
  "/",
  requireAdmin,
  ...membershipPostValidation,
  handleValidation,
  membershipController.create
);

router.put(
  "/:id",
  requireAdmin,
  ...membershipPutValidation,
  handleValidation,
  membershipController.update
);

router.delete(
  "/:id",
  requireAdmin,
  ...idParamValidation,
  handleValidation,
  membershipController.deleteById
);

module.exports = router;
