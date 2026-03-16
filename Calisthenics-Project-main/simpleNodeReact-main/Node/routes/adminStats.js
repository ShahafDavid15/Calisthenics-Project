/**
 * Admin statistics routes – routing only.
 * Business logic → adminStatsService
 */

const express = require("express");
const router = express.Router();
const adminStatsController = require("../controllers/adminStatsController");
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, requireAdmin, (req, res) =>
  adminStatsController.getStats(req, res)
);

module.exports = router;
