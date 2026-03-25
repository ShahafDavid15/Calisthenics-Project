const express = require("express");
const router = express.Router();

const purchaseRepository = require("../repositories/purchaseRepository");
const { PurchaseService } = require("../services/purchaseService");
const { PurchaseController } = require("../controllers/purchaseController");

const purchaseService = new PurchaseService(purchaseRepository);
const purchaseController = new PurchaseController(purchaseService);

const { authMiddleware } = require("../middleware/authMiddleware");
const { getPayPalCurrency } = require("../utils/paypalClient");

/**
 * Public: PayPal Client ID is not a secret (it appears in browser SDK URLs).
 * Lets the SPA load buttons when only backend/.env is configured.
 */
router.get("/paypal-client-id", (req, res) => {
  const id = process.env.PAYPAL_CLIENT_ID;
  const placeholder =
    !id ||
    id === "your_paypal_sandbox_client_id" ||
    id.startsWith("<");
  res.json({ clientId: placeholder ? null : id, currency: getPayPalCurrency() });
});

router.use(authMiddleware);

router.post("/create-order",        purchaseController.createOrder);
router.post("/capture-order",       purchaseController.captureOrder);
router.post("/purchase-membership", purchaseController.purchaseMembership);
router.get("/active-membership",    purchaseController.getActiveMembership);
router.get("/membership-history",   purchaseController.getMembershipHistory);

module.exports = router;
