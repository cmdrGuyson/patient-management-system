/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { User, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    password: "hashedPassword123",
    name: "Test User",
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutPassword: Omit<User, "password"> = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should return user without password when credentials are valid", async () => {
      const email = "test@example.com";
      const password = "password123";
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it("should return null when user does not exist", async () => {
      const email = "nonexistent@example.com";
      const password = "password123";
      usersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null when password is invalid", async () => {
      const email = "test@example.com";
      const password = "wrongpassword";
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access token and user data when login is successful", () => {
      const accessToken = "mock-access-token";
      jwtService.sign.mockReturnValue(accessToken);

      const result = service.login(mockUserWithoutPassword);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUserWithoutPassword.email,
        sub: mockUserWithoutPassword.id,
        role: mockUserWithoutPassword.role,
      });

      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: mockUserWithoutPassword.id,
          email: mockUserWithoutPassword.email,
          role: mockUserWithoutPassword.role,
        },
      });
    });
  });

  describe("validateToken", () => {
    it("should return user without password when token payload is valid", async () => {
      const payload = {
        sub: 1,
        email: "test@example.com",
        role: "USER",
      };
      usersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.validateToken(payload);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(payload.email);
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it("should return null when user does not exist", async () => {
      const payload = {
        sub: 1,
        email: "nonexistent@example.com",
        role: "USER",
      };
      usersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateToken(payload);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(payload.email);
      expect(result).toBeNull();
    });
  });
});
