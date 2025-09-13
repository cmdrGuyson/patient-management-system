/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { JwtService } from "@nestjs/jwt";

describe("Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/login", () => {
    it("returns 200 and { access_token, user } for valid credentials", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: process.env.ADMIN_EMAIL || "admin@email.com",
          password: process.env.ADMIN_PASSWORD || "ozN1$dslBR",
        })
        .expect(200);

      expect(typeof res.body.access_token).toBe("string");
      expect(res.body.access_token.length).toBeGreaterThan(10);
      expect(res.body.user).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        role: expect.any(String),
      });
    });

    it("returns 401 with 'Invalid credentials' for bad credentials", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: process.env.ADMIN_EMAIL || "admin@email.com",
          password: "wrong-password",
        })
        .expect(401);

      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /auth/profile", () => {
    it("returns 200 and user shape with valid token", async () => {
      const loginRes = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: process.env.ADMIN_EMAIL || "admin@email.com",
          password: process.env.ADMIN_PASSWORD || "ozN1$dslBR",
        })
        .expect(200);

      const token = loginRes.body.access_token as string;

      const res = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        role: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("returns 401 when Authorization header is missing", async () => {
      await request(app.getHttpServer()).get("/auth/profile").expect(401);
    });

    it("returns 401 for invalid token", async () => {
      await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);
    });

    it("returns 401 for expired token", async () => {
      const jwtSecret = process.env.JWT_SECRET || "test_secret";
      const jwt = new JwtService({ secret: jwtSecret });
      const expiredSoonToken = jwt.sign(
        {
          email: "expired@example.com",
          sub: 1,
          role: "ADMIN",
        },
        { expiresIn: 1 },
      );

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${expiredSoonToken}`)
        .expect(401);
    });
  });
});
