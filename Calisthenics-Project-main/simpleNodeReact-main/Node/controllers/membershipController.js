const { AppError } = require("../services/membershipService");

function handleError(res, err) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "שגיאת שרת" });
}

class MembershipController {
  constructor(service) {
    this.service = service;
    this.getAll = this.getAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.deleteById = this.deleteById.bind(this);
  }

  async getAll(req, res) {
    try {
      const memberships = await this.service.getAll();
      return res.json(memberships);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async create(req, res) {
    try {
      const { name, price, duration_days, entry_count } = req.body;
      const result = await this.service.create({ name, price, duration_days, entry_count });
      return res.status(201).json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async update(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, price, duration_days, entry_count } = req.body;
      const result = await this.service.update(id, { name, price, duration_days, entry_count });
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }

  async deleteById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.service.deleteById(id);
      return res.json(result);
    } catch (err) {
      return handleError(res, err);
    }
  }
}

module.exports = { MembershipController };
