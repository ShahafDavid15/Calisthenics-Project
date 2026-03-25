/**
 * Integration tests for /api/memberships
 * Tests validation and authentication on membership endpoints
 */

const request = require("supertest");
const app = require("../app");

describe("GET /api/memberships – authentication", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/memberships");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/memberships – authentication", () => {
  test("returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/memberships")
      .send({ name: "Basic", price: 100, duration_days: 30 });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/memberships – validation (with fake token)", () => {
  let adminToken;

  beforeAll(() => {
    const jwt = require("jsonwebtoken");
    adminToken = jwt.sign(
      { userId: 1, username: "admin", role: "admin" },
      process.env.JWT_SECRET || "test_secret_key",
      { expiresIn: "1h" }
    );
  });

  test("returns 400 for missing name", async () => {
    const res = await request(app)
      .post("/api/memberships")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 100, duration_days: 30 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 for negative price", async () => {
    const res = await request(app)
      .post("/api/memberships")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Basic", price: -50, duration_days: 30 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 for zero duration_days", async () => {
    const res = await request(app)
      .post("/api/memberships")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Basic", price: 100, duration_days: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 for negative entry_count", async () => {
    const res = await request(app)
      .post("/api/memberships")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Basic", price: 100, duration_days: 30, entry_count: -1 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("PUT /api/memberships/:id – authentication", () => {
  test("returns 401 without token", async () => {
    const res = await request(app)
      .put("/api/memberships/1")
      .send({ name: "Basic", price: 100, duration_days: 30 });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/memberships/:id – authentication", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).delete("/api/memberships/1");
    expect(res.status).toBe(401);
  });
});
