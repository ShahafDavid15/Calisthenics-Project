const adminStatsService = require("../services/adminStatsService");

class AdminStatsController {
  async getStats(req, res) {
    try {
      const stats = await adminStatsService.getStats();
      return res.json(stats);
    } catch (err) {
      console.error("Admin stats error:", err);
      return res.status(500).json({ error: "שגיאה בטעינת הסטטיסטיקות" });
    }
  }
}

module.exports = new AdminStatsController();
