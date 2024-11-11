const request = require("supertest");
const app = require("../server");

describe("GET /contacts", () => {
  it("responds with a list of contacts", async () => {
    const response = await request(app).get("/contacts");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
