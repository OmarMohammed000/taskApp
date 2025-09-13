import request from "supertest";

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

// import router after mocks so it uses the mocked controllers
import express from "express";
import authRoutes from "../routes/auth.ts";

describe("Auth Routes", () => {
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/auth", authRoutes);
  });

  test("POST /auth/register - should register a user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "test", email: "test@example.com", password: "test" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "register" });
  });

  test("POST /auth/login -> uses login controller", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "a@x.com", password: "pass" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accessToken: "abc" });
  });

  test("POST /auth/refresh -> uses refreshToken controller", async () => {
    const res = await request(app).post("/auth/refresh").send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ newAccessToken: "refreshed" });
  });

  test("POST /auth/logout -> uses logout controller", async () => {
    const res = await request(app).post("/auth/logout").send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "logged out" });
  });
});