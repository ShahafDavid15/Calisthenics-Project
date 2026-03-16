const workoutStatsService = require("../services/workoutStatsService");

class WorkoutStatsController {
  async getExerciseStats(req, res) {
    try {
      const stats = await workoutStatsService.getExerciseStats(
        req.user.userId,
        req.query.month
      );
      return res.json(stats);
    } catch (err) {
      console.error("Exercise stats error:", err);
      return res.status(500).json({ error: "שגיאה בטעינת הסטטיסטיקות" });
    }
  }

  async getGeneralStats(req, res) {
    try {
      const stats = await workoutStatsService.getGeneralStats();
      return res.json(stats);
    } catch (err) {
      console.error("General stats error:", err);
      return res.status(500).json({ error: "שגיאה בטעינת הסטטיסטיקות" });
    }
  }
}

module.exports = new WorkoutStatsController();
