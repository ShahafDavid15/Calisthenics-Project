/**
 * Unit tests for workoutService
 * DB is mocked – no real database connection needed
 */

jest.mock("../repositories/workoutRepository", () => ({
  getAll: jest.fn(),
  findById: jest.fn(),
  existsAtSlot: jest.fn(),
  create: jest.fn(),
  updateTime: jest.fn(),
  deleteById: jest.fn(),
}));

const workoutRepository = require("../repositories/workoutRepository");
const { workoutService } = require("../services/workoutService");

beforeEach(() => jest.clearAllMocks());

describe("workoutService.getAll", () => {
  test("filters out Saturday workouts", async () => {
    workoutRepository.getAll.mockResolvedValue([
      { workout_id: 1, workout_date: "2025-01-04", workout_time: "09:00" }, // שבת
      { workout_id: 2, workout_date: "2025-01-05", workout_time: "09:00" }, // ראשון
    ]);

    const result = await workoutService.getAll();
    expect(result).toHaveLength(1);
    expect(result[0].workout_id).toBe(2);
  });
});

describe("workoutService.create", () => {
  test("throws error when date is Saturday", async () => {
    await expect(
      workoutService.create("2025-01-04", "09:00")
    ).rejects.toThrow("לא ניתן ליצור אימון בשבת");
  });

  test("throws error when slot already taken", async () => {
    workoutRepository.existsAtSlot.mockResolvedValue(true);

    await expect(
      workoutService.create("2025-01-05", "09:00")
    ).rejects.toThrow("כבר קיים אימון בתאריך ושעה אלה");
  });

  test("creates workout successfully", async () => {
    workoutRepository.existsAtSlot.mockResolvedValue(false);
    workoutRepository.create.mockResolvedValue({ insertId: 1 });

    const result = await workoutService.create("2025-01-05", "09:00");
    expect(result).toEqual({ type: "success", text: "האימון נוסף בהצלחה" });
  });
});

describe("workoutService.deleteById", () => {
  test("throws 404 when workout not found", async () => {
    workoutRepository.deleteById.mockResolvedValue({ affectedRows: 0 });

    await expect(workoutService.deleteById(999)).rejects.toThrow("האימון לא נמצא");
  });

  test("deletes successfully", async () => {
    workoutRepository.deleteById.mockResolvedValue({ affectedRows: 1 });

    const result = await workoutService.deleteById(1);
    expect(result).toEqual({ type: "success", text: "האימון נמחק בהצלחה" });
  });
});
