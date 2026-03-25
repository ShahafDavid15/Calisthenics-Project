/**
 * Unit tests for WorkoutExerciseService
 * Repository is injected via constructor – no DB needed
 */

const { WorkoutExerciseService } = require("../services/workoutExerciseService");

const mockRepository = {
  getByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
};

const mockUserWorkoutRepository = {
  existsOnDay: jest.fn().mockResolvedValue(true),
  hasEndedOnDay: jest.fn().mockResolvedValue(true),
  getPastDates: jest.fn().mockResolvedValue([]),
};

const workoutExerciseService = new WorkoutExerciseService(mockRepository, mockUserWorkoutRepository);

beforeEach(() => {
  jest.clearAllMocks();
  mockUserWorkoutRepository.existsOnDay.mockResolvedValue(true);
  mockUserWorkoutRepository.hasEndedOnDay.mockResolvedValue(true);
});

describe("workoutExerciseService.create", () => {
  test("throws 400 for a future date", async () => {
    await expect(
      workoutExerciseService.create(1, {
        exercise: "פוש-אפ",
        repetitions: 10,
        workout_date: "2099-01-01",
      })
    ).rejects.toThrow("לא ניתן להוסיף אימון בעתיד");
  });

  test("throws 400 when user did not book a workout on that day", async () => {
    mockUserWorkoutRepository.existsOnDay.mockResolvedValue(false);

    await expect(
      workoutExerciseService.create(1, {
        exercise: "פוש-אפ",
        repetitions: 10,
        workout_date: "2024-01-01",
      })
    ).rejects.toThrow("לא נרשמת לאימון זה");
  });

  test("throws 400 when workout slot has not ended yet", async () => {
    mockUserWorkoutRepository.hasEndedOnDay.mockResolvedValue(false);

    await expect(
      workoutExerciseService.create(1, {
        exercise: "פוש-אפ",
        repetitions: 10,
        workout_date: "2024-01-01",
      })
    ).rejects.toThrow("האימון עדיין לא הסתיים");
  });

  test("creates successfully for a past date", async () => {
    mockRepository.create.mockResolvedValue({ insertId: 3 });

    const result = await workoutExerciseService.create(1, {
      exercise: "פוש-אפ",
      repetitions: 10,
      workout_date: "2024-01-01",
    });

    expect(result).toEqual({ message: "התרגיל נוסף בהצלחה", id: 3 });
  });

  test("creates successfully for today", async () => {
    mockRepository.create.mockResolvedValue({ insertId: 5 });
    const today = new Date().toISOString().split("T")[0];

    const result = await workoutExerciseService.create(1, {
      exercise: "סקוואט",
      repetitions: 20,
      workout_date: today,
    });

    expect(result.message).toBe("התרגיל נוסף בהצלחה");
  });

  test("calls repository with correct params", async () => {
    mockRepository.create.mockResolvedValue({ insertId: 8 });

    await workoutExerciseService.create(42, {
      exercise: "פולאפ",
      repetitions: 5,
      workout_date: "2024-06-15",
    });

    expect(mockRepository.create).toHaveBeenCalledWith(42, "פולאפ", 5, "2024-06-15");
  });
});

describe("workoutExerciseService.update", () => {
  test("throws 400 for a future date", async () => {
    await expect(
      workoutExerciseService.update(1, 1, {
        exercise: "סקוואט",
        repetitions: 15,
        workout_date: "2099-06-01",
      })
    ).rejects.toThrow("לא ניתן לעדכן אימון לעתיד");
  });

  test("throws 404 when exercise not found", async () => {
    mockRepository.update.mockResolvedValue({ affectedRows: 0 });

    await expect(
      workoutExerciseService.update(999, 1, {
        exercise: "פוש-אפ",
        repetitions: 10,
        workout_date: "2024-01-01",
      })
    ).rejects.toThrow("התרגיל לא נמצא");
  });

  test("updates successfully", async () => {
    mockRepository.update.mockResolvedValue({ affectedRows: 1 });

    const result = await workoutExerciseService.update(1, 1, {
      exercise: "פוש-אפ",
      repetitions: 15,
      workout_date: "2024-01-01",
    });

    expect(result).toEqual({ message: "התרגיל עודכן בהצלחה" });
  });
});

describe("workoutExerciseService.deleteById", () => {
  test("throws 404 when exercise not found", async () => {
    mockRepository.deleteById.mockResolvedValue({ affectedRows: 0 });

    await expect(workoutExerciseService.deleteById(999, 1)).rejects.toThrow(
      "התרגיל לא נמצא"
    );
  });

  test("deletes successfully", async () => {
    mockRepository.deleteById.mockResolvedValue({ affectedRows: 1 });

    const result = await workoutExerciseService.deleteById(1, 1);
    expect(result).toEqual({ message: "התרגיל נמחק בהצלחה" });
  });
});
