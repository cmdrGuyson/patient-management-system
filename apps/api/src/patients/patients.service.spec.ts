import { Test, TestingModule } from "@nestjs/testing";
import { PatientsService } from "./patients.service";
import { PrismaService } from "../prisma/prisma.service";
import { Patient } from "@prisma/client";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";

describe("PatientsService", () => {
  let service: PatientsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: {
            patient: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const mockCreatePatientDto: CreatePatientDto = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "+1234567890",
      dob: "1990-01-01",
      additionalInformation: "Allergic to penicillin",
    };

    const mockCreatedPatient: Patient = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "+1234567890",
      dob: new Date("1990-01-01"),
      additionalInformation: "Allergic to penicillin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create a new patient successfully", async () => {
      const createSpy = jest
        .spyOn(prismaService.patient, "create")
        .mockResolvedValue(mockCreatedPatient);

      const result = await service.create(mockCreatePatientDto);

      expect(createSpy).toHaveBeenCalledWith({
        data: mockCreatePatientDto,
      });
      expect(result).toEqual(mockCreatedPatient);
    });
  });

  describe("findAll", () => {
    it("should return an array of all patients", async () => {
      const mockPatients: Patient[] = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phoneNumber: "+1234567890",
          dob: new Date("1990-01-01"),
          additionalInformation: "Allergic to penicillin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phoneNumber: "+0987654321",
          dob: new Date("1985-05-15"),
          additionalInformation: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.patient, "findMany")
        .mockResolvedValue(mockPatients);

      const result = await service.findAll();

      expect(findManySpy).toHaveBeenCalledWith();
      expect(result).toEqual(mockPatients);
      expect(result).toHaveLength(2);
    });
  });

  describe("findOne", () => {
    const mockPatient: Patient = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "+1234567890",
      dob: new Date("1990-01-01"),
      additionalInformation: "Allergic to penicillin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return a patient when found by id", async () => {
      const findUniqueSpy = jest
        .spyOn(prismaService.patient, "findUnique")
        .mockResolvedValue(mockPatient);

      const result = await service.findOne(1);

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPatient);
    });
  });

  describe("update", () => {
    const mockUpdatePatientDto: UpdatePatientDto = {
      firstName: "Johnny",
      additionalInformation: "Updated medical information",
    };

    const mockUpdatedPatient: Patient = {
      id: 1,
      firstName: "Johnny",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "+1234567890",
      dob: new Date("1990-01-01"),
      additionalInformation: "Updated medical information",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should update a patient successfully", async () => {
      const updateSpy = jest
        .spyOn(prismaService.patient, "update")
        .mockResolvedValue(mockUpdatedPatient);

      const result = await service.update(1, mockUpdatePatientDto);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockUpdatePatientDto,
      });
      expect(result).toEqual(mockUpdatedPatient);
    });

    it("should update patient with partial data", async () => {
      const partialUpdateDto: UpdatePatientDto = {
        phoneNumber: "+1111111111",
      };

      const partiallyUpdatedPatient: Patient = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phoneNumber: "+1111111111",
        dob: new Date("1990-01-01"),
        additionalInformation: "Allergic to penicillin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateSpy = jest
        .spyOn(prismaService.patient, "update")
        .mockResolvedValue(partiallyUpdatedPatient);

      const result = await service.update(1, partialUpdateDto);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: partialUpdateDto,
      });
      expect(result).toEqual(partiallyUpdatedPatient);
    });
  });

  describe("remove", () => {
    const mockDeletedPatient: Patient = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "+1234567890",
      dob: new Date("1990-01-01"),
      additionalInformation: "Allergic to penicillin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should delete a patient successfully", async () => {
      const deleteSpy = jest
        .spyOn(prismaService.patient, "delete")
        .mockResolvedValue(mockDeletedPatient);

      const result = await service.remove(1);

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDeletedPatient);
    });
  });
});
