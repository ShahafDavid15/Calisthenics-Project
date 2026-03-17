/**
 * Unit tests for MembershipService
 * Repository is injected via constructor – no DB needed
 */

const { MembershipService } = require("../services/membershipService");

const mockRepository = {
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
};

const membershipService = new MembershipService(mockRepository);

beforeEach(() => jest.clearAllMocks());

describe("membershipService.create", () => {
  test("calculates VAT correctly (18%)", async () => {
    mockRepository.create.mockResolvedValue({ insertId: 5 });

    const result = await membershipService.create({
      name: "Basic",
      price: 100,
      duration_days: 30,
    });

    expect(result.price_with_vat).toBe(118);
  });

  test("VAT calculation is rounded to 2 decimal places", async () => {
    mockRepository.create.mockResolvedValue({ insertId: 2 });

    const result = await membershipService.create({
      name: "Standard",
      price: 99.99,
      duration_days: 30,
    });

    expect(result.price_with_vat).toBe(117.99);
  });

  test("default entry_count is 0 when not provided", async () => {
    mockRepository.create.mockResolvedValue({ insertId: 1 });

    const result = await membershipService.create({
      name: "Basic",
      price: 50,
      duration_days: 30,
    });

    expect(result.entry_count).toBe(0);
  });

  test("returns membership data with correct fields", async () => {
    mockRepository.create.mockResolvedValue({ insertId: 7 });

    const result = await membershipService.create({
      name: "Premium",
      price: 200,
      duration_days: 90,
      entry_count: 12,
    });

    expect(result).toMatchObject({
      message: "מנוי נוסף בהצלחה",
      membership_id: 7,
      name: "Premium",
      price: 200,
      duration_days: 90,
      entry_count: 12,
    });
  });
});

describe("membershipService.update", () => {
  test("throws 404 when membership not found", async () => {
    mockRepository.update.mockResolvedValue({ affectedRows: 0 });

    await expect(
      membershipService.update(999, { name: "X", price: 100, duration_days: 30 })
    ).rejects.toThrow("המנוי לא נמצא");
  });

  test("updates and recalculates VAT correctly", async () => {
    mockRepository.update.mockResolvedValue({ affectedRows: 1 });

    const result = await membershipService.update(1, {
      name: "Standard",
      price: 150,
      duration_days: 60,
      entry_count: 8,
    });

    expect(result.price_with_vat).toBe(177);
    expect(result.message).toBe("מנוי עודכן בהצלחה");
  });
});

describe("membershipService.deleteById", () => {
  test("throws 404 when not found", async () => {
    mockRepository.deleteById.mockResolvedValue({ affectedRows: 0 });

    await expect(membershipService.deleteById(999)).rejects.toThrow("המנוי לא נמצא");
  });

  test("deletes successfully", async () => {
    mockRepository.deleteById.mockResolvedValue({ affectedRows: 1 });

    const result = await membershipService.deleteById(1);
    expect(result).toEqual({ message: "מנוי נמחק בהצלחה" });
  });
});

describe("membershipService.getAll", () => {
  test("returns all memberships from repository", async () => {
    const fakeMemberships = [
      { membership_id: 1, name: "Basic", price: 100 },
      { membership_id: 2, name: "Premium", price: 200 },
    ];
    mockRepository.getAll.mockResolvedValue(fakeMemberships);

    const result = await membershipService.getAll();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Basic");
  });
});
