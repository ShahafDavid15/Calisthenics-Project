const { AppError } = require("../services/purchaseService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "שגיאת שרת" });
}

class PurchaseController {
  constructor(service) {
    this.service = service;
    this.createOrder = this.createOrder.bind(this);
    this.captureOrder = this.captureOrder.bind(this);
    this.purchaseMembership = this.purchaseMembership.bind(this);
    this.getActiveMembership = this.getActiveMembership.bind(this);
    this.getMembershipHistory = this.getMembershipHistory.bind(this);
  }

  async createOrder(req, res) {
    try {
      const { membership_name, price } = req.body;
      const result = await this.service.createPaypalOrder(membership_name, price);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async captureOrder(req, res) {
    try {
      const { orderID } = req.body;
      const result = await this.service.capturePaypalOrder(orderID);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async purchaseMembership(req, res) {
    try {
      const { membership_name, paypal_order_id, payer_id, price } = req.body;
      const result = await this.service.purchaseMembership(req.user.userId, {
        membership_name,
        paypal_order_id,
        payer_id,
        price,
      });
      return res.status(201).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getActiveMembership(req, res) {
    try {
      const membership = await this.service.getActiveMembership(req.user.userId);
      return res.json(membership);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async getMembershipHistory(req, res) {
    try {
      const history = await this.service.getMembershipHistory(req.user.userId);
      return res.json(history);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = { PurchaseController };
