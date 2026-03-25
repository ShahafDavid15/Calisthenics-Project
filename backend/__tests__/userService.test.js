/**
 * Unit tests for UserService
 * Repository is injected via constructor – no DB needed
 * bcrypt/jwt calls are real (no mock) since they don't need a DB
 */

const { UserService } = require("../services/userService");

process.env.JWT_SECRET = "test_secret_for_unit_tests";

const mockRepository = {
  findUserByUsername: jest.fn(),
  createUser: jest.fn(),
  findUserById: jest.fn(),
  getAllUsersWithLatestMembership: jest.fn(),
  updateUserProfile: jest.fn(),
  findUserByEmail: jest.fn(),
  updateUserPasswordById: jest.fn(),
  updateUserPasswordByUsername: jest.fn(),
  getUsernameByEmail: jest.fn(),
};

const userService = new UserService(mockRepository);

beforeEach(() => jest.clearAllMocks());

describe("userService.registerUser", () => {
  test("throws 409 if username already exists", async () => {
    mockRepository.findUserByUsername.mockResolvedValue({ username: "existing" });

    await expect(
      userService.registerUser({ username: "existing", password: "Test1234" })
    ).rejects.toThrow("Username already exists");
  });

  test("registers successfully when username is available", async () => {
    mockRepository.findUserByUsername.mockResolvedValue(null);
    mockRepository.createUser.mockResolvedValue({ insertId: 1 });

    const result = await userService.registerUser({
      username: "newuser",
      password: "Test1234",
    });

    expect(result).toMatchObject({
      message: "User registered",
      username: "newuser",
      user_id: 1,
    });
  });

  test("throws 400 if username is missing", async () => {
    await expect(
      userService.registerUser({ username: "", password: "Test1234" })
    ).rejects.toThrow("Username and password are required");
  });

  test("throws 400 if password is missing", async () => {
    await expect(
      userService.registerUser({ username: "testuser", password: "" })
    ).rejects.toThrow("Username and password are required");
  });

  test("throws 403 if username is reserved admin", async () => {
    await expect(
      userService.registerUser({ username: "Admin", password: "Test1234" })
    ).rejects.toThrow("Username is reserved for the system administrator");
    expect(mockRepository.findUserByUsername).not.toHaveBeenCalled();
  });
});

describe("userService.loginUser", () => {
  test("throws 401 if user does not exist", async () => {
    mockRepository.findUserByUsername.mockResolvedValue(null);

    await expect(
      userService.loginUser({ username: "nobody", password: "Test1234" })
    ).rejects.toThrow("Username or password is incorrect");
  });

  test("throws 401 if password is wrong", async () => {
    const bcrypt = require("bcrypt");
    const hash = await bcrypt.hash("CorrectPass1", 10);

    mockRepository.findUserByUsername.mockResolvedValue({
      user_id: 1,
      username: "testuser",
      password: hash,
      role: "user",
    });

    await expect(
      userService.loginUser({ username: "testuser", password: "WrongPass1" })
    ).rejects.toThrow("Username or password is incorrect");
  });

  test("returns token on successful login", async () => {
    const bcrypt = require("bcrypt");
    const hash = await bcrypt.hash("Test1234", 10);

    mockRepository.findUserByUsername.mockResolvedValue({
      user_id: 5,
      username: "testuser",
      password: hash,
      role: "user",
    });

    const result = await userService.loginUser({
      username: "testuser",
      password: "Test1234",
    });

    expect(result).toHaveProperty("token");
    expect(result.username).toBe("testuser");
    expect(result.role).toBe("user");
  });
});

describe("userService.getUserById", () => {
  test("throws 404 if user not found", async () => {
    mockRepository.findUserById.mockResolvedValue(null);

    await expect(userService.getUserById(999)).rejects.toThrow("User not found");
  });

  test("returns user when found", async () => {
    const fakeUser = { user_id: 1, username: "testuser" };
    mockRepository.findUserById.mockResolvedValue(fakeUser);

    const result = await userService.getUserById(1);
    expect(result.username).toBe("testuser");
  });
});

describe("userService.updateUserProfile", () => {
  test("throws 400 if required fields are missing", async () => {
    await expect(
      userService.updateUserProfile({
        username: "testuser",
        firstName: "",
        lastName: "Doe",
        phone: "0501234567",
        email: "test@test.com",
        gender: "male",
      })
    ).rejects.toThrow("Missing required fields");
  });

  test("throws 404 if user not found", async () => {
    mockRepository.updateUserProfile.mockResolvedValue({ affectedRows: 0 });

    await expect(
      userService.updateUserProfile({
        username: "nobody",
        firstName: "John",
        lastName: "Doe",
        phone: "0501234567",
        email: "test@test.com",
        gender: "male",
      })
    ).rejects.toThrow("User not found");
  });
});
