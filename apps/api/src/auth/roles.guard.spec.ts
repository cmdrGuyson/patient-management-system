import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { RolesGuard } from "./roles.guard";
import { Role } from "@prisma/client";
import { JwtUser } from "./auth.types";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    let mockContext: ExecutionContext;
    let mockRequest: { user: JwtUser };

    beforeEach(() => {
      mockRequest = {
        user: {
          userId: 1,
          email: "test@example.com",
          role: "ADMIN",
        } as JwtUser,
      };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;
    });

    it("should allow access when no roles are required", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(null);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it("should allow access when user has one of the required roles", () => {
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([Role.ADMIN, Role.USER]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it("should deny access when user does not have required role", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([Role.ADMIN]);
      mockRequest.user.role = "USER";

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });
});
