/**
 * Public purchase-related routes (no JWT)
 */

const request = require("supertest");
const app = require("../app");

describe("GET /api/purchases/paypal-client-id", () => {
  test("returns 200 with clientId and currency", async () => {
    const res = await request(app).get("/api/purchases/paypal-client-id");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("clientId");
    expect(res.body).toHaveProperty("currency");
    expect(typeof res.body.currency).toBe("string");
  });
});

afterAll((done) => {
  const db = require("../db");
  db.end(done);
});
