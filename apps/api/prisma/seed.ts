import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type SeedPatient = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  additionalInformation?: string | null;
};

async function main() {
  // Seed users
  const adminPasswordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "ozN1$dslBR",
    10,
  );
  const userPasswordHash = await bcrypt.hash(
    process.env.USER_PASSWORD || "ozN1$dslBR",
    10,
  );

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@email.com" },
    create: {
      email: process.env.ADMIN_EMAIL || "admin@email.com",
      password: adminPasswordHash,
      name: process.env.ADMIN_NAME || "Admin User",
      role: Role.ADMIN,
    },
    update: {
      password: adminPasswordHash,
      name: process.env.ADMIN_NAME || "Admin User",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: process.env.USER_EMAIL || "user@email.com" },
    create: {
      email: process.env.USER_EMAIL || "user@email.com",
      password: userPasswordHash,
      name: process.env.USER_NAME || "General User",
      role: Role.USER,
    },
    update: {
      password: userPasswordHash,
      name: process.env.USER_NAME || "General User",
      role: Role.USER,
    },
  });

  // Seed patients from JSON file
  const patientsJsonPath = path.resolve(__dirname, "../data/patients.json");
  const patientsRaw = fs.readFileSync(patientsJsonPath, "utf8");
  const parsed = JSON.parse(patientsRaw) as unknown;
  const patients: SeedPatient[] = Array.isArray(parsed)
    ? (parsed as SeedPatient[])
    : [];

  await Promise.all(
    patients.map((p) =>
      prisma.patient.upsert({
        where: { email: p.email },
        create: {
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phoneNumber: p.phoneNumber,
          dob: new Date(p.dob),
          additionalInformation: p.additionalInformation ?? undefined,
        },
        update: {},
      }),
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
