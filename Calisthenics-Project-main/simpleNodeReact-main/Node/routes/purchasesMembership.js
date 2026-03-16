/**
 * Membership purchase routes – routing only.
 * Business logic → purchaseService
 * DB queries     → purchaseRepository
 */

const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/create-order",        (req, res) => purchaseController.createOrder(req, res));
router.post("/capture-order",       (req, res) => purchaseController.captureOrder(req, res));
router.post("/purchase-membership", (req, res) => purchaseController.purchaseMembership(req, res));
router.get("/active-membership",    (req, res) => purchaseController.getActiveMembership(req, res));

module.exports = router;
