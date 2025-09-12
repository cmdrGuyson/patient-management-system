/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponse } from "./auth.types";
import { Role } from "@prisma/client";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockLoginResponse: LoginResponse = {
    access_token: "mock-jwt-token",
    user: {
      id: 1,
      email: "test@example.com",
      role: "USER",
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return access token and user data on successful login", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      jest.spyOn(authService, "validateUser").mockResolvedValue({
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(authService, "login").mockReturnValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(authService.login).toHaveBeenCalledWith({
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: Role.USER,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      });
      expect(result).toEqual(mockLoginResponse);
    });

    it("should throw UnauthorizedException when user is not returned from service", async () => {
      const loginDto: LoginDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      jest.spyOn(authService, "validateUser").mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        "Invalid credentials",
      );

      expect(authService.validateUser).toHaveBeenCalledWith(
        "nonexistent@example.com",
        "password123",
      );
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
