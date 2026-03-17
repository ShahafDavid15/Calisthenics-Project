const express = require("express");
const router = express.Router();

const purchaseRepository = require("../repositories/purchaseRepository");
const { PurchaseService } = require("../services/purchaseService");
const { PurchaseController } = require("../controllers/purchaseController");

const purchaseService = new PurchaseService(purchaseRepository);
const purchaseController = new PurchaseController(purchaseService);

const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/create-order",        purchaseController.createOrder);
router.post("/capture-order",       purchaseController.captureOrder);
router.post("/purchase-membership", purchaseController.purchaseMembership);
router.get("/active-membership",    purchaseController.getActiveMembership);

module.exports = router;
