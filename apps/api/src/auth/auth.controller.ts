import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponse } from "./auth.types";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { GetUser } from "./get-user.decorator";
import type { JwtPayload } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.authService.login(user);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: JwtPayload) {
    const userProfile = await this.authService.validateToken(user);

    if (!userProfile) {
      throw new UnauthorizedException("Invalid token");
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  }
}
