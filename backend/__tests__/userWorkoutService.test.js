/**
 * Unit tests for UserWorkoutService
 * Repository is injected via constructor – no DB needed
 */

const { UserWorkoutService } = require("../services/userWorkoutService");

const mockRepository = {
  existsAtSlot: jest.fn(),
  existsOnDay: jest.fn(),
  countThisWeek: jest.fn(),
  create: jest.fn(),
  deleteById: jest.fn(),
  getByUserId: jest.fn(),
  getParticipantCounts: jest.fn(),
};

const userWorkoutService = new UserWorkoutService(mockRepository);

beforeEach(() => jest.clearAllMocks());

describe("userWorkoutService.book – slot & day validation", () => {
  test("throws 409 if slot already taken", async () => {
    mockRepository.existsAtSlot.mockResolvedValue(true);

    await expect(
      userWorkoutService.book(1, "2025-01-05", "09:00", "Premium")
    ).rejects.toThrow("כבר רשום לאימון בשעה זו");
  });

  test("throws 409 if already booked on same day", async () => {
    mockRepository.existsAtSlot.mockResolvedValue(false);
    mockRepository.existsOnDay.mockResolvedValue(true);

    await expect(
      userWorkoutService.book(1, "2025-01-05", "09:00", "Premium")
    ).rejects.toThrow("לא ניתן להירשם ליותר מאימון אחד ביום");
  });
});

describe("userWorkoutService.book – weekly limit by membership", () => {
  beforeEach(() => {
    mockRepository.existsAtSlot.mockResolvedValue(false);
    mockRepository.existsOnDay.mockResolvedValue(false);
  });

  test("Basic: max 1 workout per week – throws when at limit", async () => {
    mockRepository.countThisWeek.mockResolvedValue(1);

    await expect(
      userWorkoutService.book(1, "2025-01-05", "09:00", "Basic")
    ).rejects.toThrow("לא ניתן להירשם ליותר מ-1 אימונים בשבוע");
  });

  test("Standard: max 2 workouts per week – throws when at limit", async () => {
    mockRepository.countThisWeek.mockResolvedValue(2);

    await expect(
      userWorkoutService.book(1, "2025-01-05", "09:00", "Standard")
    ).rejects.toThrow("לא ניתן להירשם ליותר מ-2 אימונים בשבוע");
  });

  test("Premium: max 3 workouts per week – throws when at limit", async () => {
    mockRepository.countThisWeek.mockResolvedValue(3);

    await expect(
      userWorkoutService.book(1, "2025-01-05", "09:00", "Premium")
    ).rejects.toThrow("לא ניתן להירשם ליותר מ-3 אימונים בשבוע");
  });

  test("Basic: allows booking when under limit (0 workouts this week)", async () => {
    mockRepository.countThisWeek.mockResolvedValue(0);
    mockRepository.create.mockResolvedValue({ insertId: 10 });

    const result = await userWorkoutService.book(1, "2025-01-05", "09:00", "Basic");
    expect(result.message).toBe("הרשמה לאימון בוצעה בהצלחה");
  });

  test("Standard: allows booking when under limit (1 workout this week)", async () => {
    mockRepository.countThisWeek.mockResolvedValue(1);
    mockRepository.create.mockResolvedValue({ insertId: 11 });

    const result = await userWorkoutService.book(1, "2025-01-05", "11:00", "Standard");
    expect(result.message).toBe("הרשמה לאימון בוצעה בהצלחה");
  });

  test("membership_name matching is case-insensitive", async () => {
    mockRepository.countThisWeek.mockResolvedValue(1);

    // "BASIC" כתוב באותיות גדולות – אמור עדיין להחיל מגבלה של 1
    await expect(
      userWorkoutService.book(1, "2025-01-05", "09:00", "BASIC")
    ).rejects.toThrow("לא ניתן להירשם ליותר מ-1 אימונים בשבוע");
  });
});

describe("userWorkoutService.cancel", () => {
  test("throws 404 when booking not found", async () => {
    mockRepository.deleteById.mockResolvedValue({ affectedRows: 0 });

    await expect(userWorkoutService.cancel(999, 1)).rejects.toThrow(
      "האימון לא נמצא או כבר בוטל"
    );
  });

  test("cancels successfully", async () => {
    mockRepository.deleteById.mockResolvedValue({ affectedRows: 1 });

    const result = await userWorkoutService.cancel(5, 1);
    expect(result).toEqual({ message: "האימון בוטל בהצלחה" });
  });
});

describe("userWorkoutService.getParticipantCounts", () => {
  test("builds correct key format (date|time)", async () => {
    mockRepository.getParticipantCounts.mockResolvedValue([
      { workout_date: "2025-01-05", workout_time: "09:00", participant_count: 3 },
      { workout_date: "2025-01-06", workout_time: "18:00", participant_count: 7 },
    ]);

    const result = await userWorkoutService.getParticipantCounts();

    expect(result["2025-01-05|09:00"]).toBe(3);
    expect(result["2025-01-06|18:00"]).toBe(7);
  });

  test("returns empty object when no data", async () => {
    mockRepository.getParticipantCounts.mockResolvedValue([]);

    const result = await userWorkoutService.getParticipantCounts();
    expect(result).toEqual({});
  });
});
