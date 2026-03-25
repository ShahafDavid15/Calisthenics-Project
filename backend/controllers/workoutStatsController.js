class WorkoutStatsController {
  constructor(service) {
    this.service = service;
    this.getExerciseStats = this.getExerciseStats.bind(this);
    this.getGeneralStats = this.getGeneralStats.bind(this);
    this.getExerciseProgress = this.getExerciseProgress.bind(this);
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

  async getExerciseProgress(req, res) {
    try {
      const { exercise } = req.query;
      if (!exercise) {
        return res.status(400).json({ error: "חסר שם תרגיל" });
      }
      const data = await this.service.getExerciseProgress(req.user.userId, exercise);
      return res.json(data);
    } catch (err) {
      console.error("Exercise progress error:", err);
      return res.status(500).json({ error: "שגיאה בטעינת נתוני ההתקדמות" });
    }
  }
}

module.exports = { WorkoutStatsController };
