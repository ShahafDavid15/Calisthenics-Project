/**
 * Membership routes – routing only.
 * Business logic → membershipService
 * DB queries     → membershipRepository
 */

const express = require("express");
const router = express.Router();
const membershipController = require("../controllers/membershipController");
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
const {
  handleValidation,
  membershipPostValidation,
  membershipPutValidation,
  idParamValidation,
} = require("../middleware/validators");

router.use(authMiddleware);

router.get("/", (req, res) => membershipController.getAll(req, res));

router.post(
  "/",
  requireAdmin,
  ...membershipPostValidation,
  handleValidation,
  (req, res) => membershipController.create(req, res)
);

router.put(
  "/:id",
  requireAdmin,
  ...membershipPutValidation,
  handleValidation,
  (req, res) => membershipController.update(req, res)
);

router.delete(
  "/:id",
  requireAdmin,
  ...idParamValidation,
  handleValidation,
  (req, res) => membershipController.deleteById(req, res)
);

module.exports = router;
