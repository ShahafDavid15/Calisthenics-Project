const express = require("express");
const router = express.Router();

const adminStatsRepository = require("../repositories/adminStatsRepository");
const { AdminStatsService } = require("../services/adminStatsService");
const { AdminStatsController } = require("../controllers/adminStatsController");

const adminStatsService = new AdminStatsService(adminStatsRepository);
const adminStatsController = new AdminStatsController(adminStatsService);

const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, requireAdmin, adminStatsController.getStats);

module.exports = router;
