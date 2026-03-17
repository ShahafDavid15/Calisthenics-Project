/**
 * Integration tests for auth endpoints (login, register)
 * Uses supertest – no real server needed
 */

const request = require("supertest");
const app = require("../app");

describe("POST /api/users/login – validation", () => {
  test("returns 400 for short username", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ username: "a", password: "Test1234" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 for weak password (no digit)", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ username: "testuser", password: "onlyletters" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 for weak password (too short)", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ username: "testuser", password: "Ab1" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/users – register validation", () => {
  test("returns 400 for missing username", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ password: "Test1234" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 for weak password", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ username: "newuser", password: "weak" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/workouts – requires auth", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/workouts");
    expect(res.status).toBe(401);
  });
});

afterAll((done) => {
  const db = require("../db");
  db.end(done);
});
