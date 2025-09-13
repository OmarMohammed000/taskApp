import express from "express";
import request from "supertest";

// mock the actual TS modules (paths relative to this test file)
jest.mock("../controllers/Auth/register.ts", () => ({
  __esModule: true,
  default: jest.fn((req, res) => res.status(201).json({ message: "register" })),
}));
jest.mock("../controllers/Auth/login.ts", () => ({
  __esModule: true,
  default: jest.fn((req, res) => res.status(200).json({ accessToken: "abc" })),
}));
jest.mock("../controllers/Auth/refershtoken.ts", () => ({
  __esModule: true,
  default: jest.fn((req, res) => res.status(200).json({ newAccessToken: "refreshed" })),
}));
jest.mock("../controllers/Auth/logout.ts", () => ({
  __esModule: true,
  default: jest.fn((req, res) => res.status(200).json({ message: "logged out" })),
}));


import authRoutes from "../routes/auth.js";

describe("Auth Routes", () => {
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/auth", authRoutes);
  });

  test("POST /auth/register", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "t", email: "t@x", password: "p" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "register" });
  });

  test("POST /auth/login", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "a@x.com", password: "p" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accessToken: "abc" });
  });

  test("POST /auth/refresh", async () => {
    const res = await request(app).post("/auth/refresh").send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ newAccessToken: "refreshed" });
  });

  test("POST /auth/logout", async () => {
    const res = await request(app).post("/auth/logout").send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "logged out" });
  });
});