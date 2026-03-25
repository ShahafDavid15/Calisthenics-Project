class AdminStatsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getStats() {
    const [users, memberships, totalWorkouts, popularDay, popularTime, monthlyIncome] =
      await Promise.all([
        this.repository.getUserCount(),
        this.repository.getMembershipDistribution(),
        this.repository.getTotalWorkouts(),
        this.repository.getMostPopularDay(),
        this.repository.getMostPopularTime(),
        this.repository.getMonthlyIncome(),
      ]);

    return {
      total_users:       users[0]?.total_users || 0,
      memberships,
      total_workouts:    totalWorkouts[0]?.total_workouts || 0,
      most_popular_day:  popularDay[0]?.workout_date || null,
      most_popular_time: popularTime[0]?.workout_time || null,
      monthly_income:    monthlyIncome,
    };
  }
}

module.exports = { AdminStatsService };
