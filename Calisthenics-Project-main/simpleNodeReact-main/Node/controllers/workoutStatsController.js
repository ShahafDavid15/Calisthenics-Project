class WorkoutStatsController {
  constructor(service) {
    this.service = service;
    this.getExerciseStats = this.getExerciseStats.bind(this);
    this.getGeneralStats = this.getGeneralStats.bind(this);
  }

  async getExerciseStats(req, res) {
    try {
      const stats = await this.service.getExerciseStats(req.user.userId, req.query.month);
      return res.json(stats);
    } catch (err) {
      console.error("Exercise stats error:", err);
      return res.status(500).json({ error: "שגיאה בטעינת הסטטיסטיקות" });
    }
  }

  async getGeneralStats(req, res) {
    try {
      const stats = await this.service.getGeneralStats();
      return res.json(stats);
    } catch (err) {
      console.error("General stats error:", err);
      return res.status(500).json({ error: "שגיאה בטעינת הסטטיסטיקות" });
    }
  }
}

module.exports = { WorkoutStatsController };
