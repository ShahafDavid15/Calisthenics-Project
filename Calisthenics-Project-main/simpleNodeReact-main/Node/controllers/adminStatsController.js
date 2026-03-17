class AdminStatsController {
  constructor(service) {
    this.service = service;
    this.getStats = this.getStats.bind(this);
  }

  async getStats(req, res) {
    try {
      const stats = await this.service.getStats();
      return res.json(stats);
    } catch (err) {
      console.error("Admin stats error:", err);
      return res.status(500).json({ error: "שגיאה בטעינת הסטטיסטיקות" });
    }
  }
}

module.exports = { AdminStatsController };
