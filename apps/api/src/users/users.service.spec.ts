import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";
import { User, Role, Prisma } from "@prisma/client";
import { ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");
const mockedBcrypt = jest.mocked(bcrypt);

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should have prismaService injected", () => {
    expect(prismaService).toBeDefined();
  });

  describe("findOneByEmail", () => {
    it("should return a user when found", async () => {
      const mockUser: User = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const findUniqueSpy = jest
        .spyOn(prismaService.user, "findUnique")
        .mockResolvedValue(mockUser);

      const result = await service.findOneByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null when user not found", async () => {
      const findUniqueSpy = jest
        .spyOn(prismaService.user, "findUnique")
        .mockResolvedValue(null);

      const result = await service.findOneByEmail("nonexistent@example.com");

      expect(result).toBeNull();
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a user when found by id", async () => {
      const mockUser: User = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const findUniqueSpy = jest
        .spyOn(prismaService.user, "findUnique")
        .mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe("create", () => {
    const mockUserData: Prisma.UserCreateInput = {
      email: "newuser@example.com",
      password: "plainPassword123",
      name: "New User",
      role: Role.USER,
    };

    const mockCreatedUser: User = {
      id: 2,
      email: "newuser@example.com",
      password: "hashedPassword123",
      name: "New User",
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedUserWithoutPassword = {
      id: 2,
      email: "newuser@example.com",
      name: "New User",
      role: Role.USER,
      createdAt: mockCreatedUser.createdAt,
      updatedAt: mockCreatedUser.updatedAt,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockedBcrypt.hash.mockClear();
    });

    it("should create a new user successfully", async () => {
      const findUniqueSpy = jest
        .spyOn(prismaService.user, "findUnique")
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(prismaService.user, "create")
        .mockResolvedValue(mockCreatedUser);
      mockedBcrypt.hash.mockResolvedValue("hashedPassword123" as never);

      const result = await service.create(mockUserData);

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          ...mockUserData,
          password: "hashedPassword123",
        },
      });
      expect(result).toEqual(expectedUserWithoutPassword);
    });

    it("should throw ConflictException when user with email already exists", async () => {
      const existingUser: User = {
        id: 1,
        email: "newuser@example.com",
        password: "existingPassword",
        name: "Existing User",
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.user, "findUnique")
        .mockResolvedValue(existingUser);

      await expect(service.create(mockUserData)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockUserData)).rejects.toThrow(
        "User with this email already exists",
      );

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
    });

    it("should hash password with correct salt rounds", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);
      const createSpy = jest
        .spyOn(prismaService.user, "create")
        .mockResolvedValue(mockCreatedUser);
      mockedBcrypt.hash.mockResolvedValue("hashedPassword123" as never);

      await service.create(mockUserData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          ...mockUserData,
          password: "hashedPassword123",
        },
      });
    });

    it("should return user without password field", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);
      jest
        .spyOn(prismaService.user, "create")
        .mockResolvedValue(mockCreatedUser);
      mockedBcrypt.hash.mockResolvedValue("hashedPassword123" as never);

      const result = await service.create(mockUserData);

      expect(result).not.toHaveProperty("password");
      expect(result).toEqual(expectedUserWithoutPassword);
    });
  });
});
