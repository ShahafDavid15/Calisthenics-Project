class WorkoutStatsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getExerciseStats(userId, month) {
    return this.repository.getExerciseStats(userId, month);
  }

  async getGeneralStats() {
    const rows = await this.repository.getGeneralStats();
    return rows[0];
  }

  async getExerciseProgress(userId, exercise) {
    return this.repository.getExerciseProgress(userId, exercise);
  }
}

module.exports = { WorkoutStatsService };
