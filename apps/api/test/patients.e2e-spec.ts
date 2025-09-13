/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Patients (e2e)", () => {
  let app: INestApplication;

  const getAdminCreds = () => ({
    email: process.env.ADMIN_EMAIL || "admin@email.com",
    password: process.env.ADMIN_PASSWORD || "ozN1$dslBR",
  });

  const getUserCreds = () => ({
    email: process.env.USER_EMAIL || "user@email.com",
    password: process.env.USER_PASSWORD || "ozN1$dslBR",
  });

  const loginAndGetToken = async (email: string, password: string) => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password })
      .expect(200);
    return res.body.access_token as string;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /patients", () => {
    it("should list and get patients (user)", async () => {
      const userToken = await loginAndGetToken(
        getUserCreds().email,
        getUserCreds().password,
      );

      const listRes = await request(app.getHttpServer())
        .get("/patients")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      expect(Array.isArray(listRes.body)).toBe(true);

      if (listRes.body.length > 0) {
        const id = listRes.body[0].id as number;
        const oneRes = await request(app.getHttpServer())
          .get(`/patients/${id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .expect(200);
        expect(oneRes.body).toMatchObject({ id: expect.any(Number) });
      }
    });
  });

  describe("POST /patients validation", () => {
    it("should return 400 when creating patient with missing required fields", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );

      const res = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/First name is required/),
          expect.stringMatching(/Last name is required/),
          expect.stringMatching(/Email is required/),
          expect.stringMatching(/Phone number is required/),
          expect.stringMatching(/Date of birth is required/),
        ]),
      );
    });

    it("should return 400 when creating patient with invalid email and dob", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );

      const res = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "Jane",
          lastName: "Doe",
          email: "not-an-email",
          phoneNumber: "555-000-1111",
          dob: "not-a-date",
        })
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Please provide a valid email address/),
          expect.stringMatching(/Date of birth must be a valid date/),
        ]),
      );
    });
  });

  describe("Authorization", () => {
    it("should return 403 when USER tries to create a patient", async () => {
      const userToken = await loginAndGetToken(
        getUserCreds().email,
        getUserCreds().password,
      );

      const unique = Date.now();
      await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          firstName: "Role",
          lastName: "Guard",
          email: `role.guard+${unique}@example.com`,
          phoneNumber: "555-333-4444",
          dob: "1991-02-03",
        })
        .expect(403);
    });

    it("should return 401 when token is missing", async () => {
      await request(app.getHttpServer()).get("/patients").expect(401);
    });
  });

  describe("GET /patients/:id", () => {
    it("should return a patient by id", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );

      const unique = Date.now();
      const createRes = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "Find",
          lastName: "One",
          email: `find.one+${unique}@example.com`,
          phoneNumber: "555-100-2000",
          dob: new Date("1992-03-04").toISOString(),
        })
        .expect(201);

      const id = createRes.body.id as number;

      const getRes = await request(app.getHttpServer())
        .get(`/patients/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(getRes.body).toMatchObject({ id });
    });
  });

  describe("PATCH /patients/:id", () => {
    it("should update an existing patient", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );

      const unique = Date.now();
      const createRes = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "To",
          lastName: "Update",
          email: `to.update+${unique}@example.com`,
          phoneNumber: "555-400-5000",
          dob: new Date("1993-04-05").toISOString(),
        })
        .expect(201);

      const id = createRes.body.id as number;

      const updateRes = await request(app.getHttpServer())
        .patch(`/patients/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ phoneNumber: "555-999-0000" })
        .expect(200);

      expect(updateRes.body).toMatchObject({ id, phoneNumber: "555-999-0000" });
    });

    it("should return 401 without token", async () => {
      await request(app.getHttpServer())
        .patch("/patients/1")
        .send({ phoneNumber: "555-999-0000" })
        .expect(401);
    });

    it("should return 403 when USER tries to update a patient", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );
      const userToken = await loginAndGetToken(
        getUserCreds().email,
        getUserCreds().password,
      );

      const unique = Date.now();
      const createRes = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "User",
          lastName: "CannotUpdate",
          email: `user.cannot.update+${unique}@example.com`,
          phoneNumber: "555-600-7000",
          dob: new Date("1996-07-08").toISOString(),
        })
        .expect(201);

      const id = createRes.body.id as number;

      await request(app.getHttpServer())
        .patch(`/patients/${id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ phoneNumber: "555-999-0000" })
        .expect(403);

      // cleanup
      await request(app.getHttpServer())
        .delete(`/patients/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe("DELETE /patients/:id", () => {
    it("should delete an existing patient", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );

      const unique = Date.now();
      const createRes = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "To",
          lastName: "Delete",
          email: `to.delete+${unique}@example.com`,
          phoneNumber: "555-700-8000",
          dob: new Date("1994-05-06").toISOString(),
        })
        .expect(201);

      const id = createRes.body.id as number;

      const delRes = await request(app.getHttpServer())
        .delete(`/patients/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(delRes.body).toMatchObject({ id });
    });

    it("should return 403 when USER tries to delete", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );
      const userToken = await loginAndGetToken(
        getUserCreds().email,
        getUserCreds().password,
      );

      const unique = Date.now();
      const createRes = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "User",
          lastName: "CannotDelete",
          email: `user.cannot.delete+${unique}@example.com`,
          phoneNumber: "555-800-9000",
          dob: new Date("1995-06-07").toISOString(),
        })
        .expect(201);

      const id = createRes.body.id as number;

      await request(app.getHttpServer())
        .delete(`/patients/${id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      // cleanup
      await request(app.getHttpServer())
        .delete(`/patients/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });

    it("should return 403 when USER tries to delete a patient", async () => {
      const adminToken = await loginAndGetToken(
        getAdminCreds().email,
        getAdminCreds().password,
      );
      const userToken = await loginAndGetToken(
        getUserCreds().email,
        getUserCreds().password,
      );

      const unique = Date.now();
      const createRes = await request(app.getHttpServer())
        .post("/patients")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "User",
          lastName: "CannotDeleteAgain",
          email: `user.cannot.delete.again+${unique}@example.com`,
          phoneNumber: "555-900-1000",
          dob: new Date("1997-08-09").toISOString(),
        })
        .expect(201);

      const id = createRes.body.id as number;

      await request(app.getHttpServer())
        .delete(`/patients/${id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      // cleanup
      await request(app.getHttpServer())
        .delete(`/patients/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
