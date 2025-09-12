import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JwtPayload, LoginResponse } from "./auth.types";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials by checking email and password against the database.
   *
   * @param email - The user's email address
   * @param password - The plain text password to validate
   * @returns User object without password if credentials are valid, null otherwise
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, "password"> | null> {
    // Check if user exists
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return null;
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;

    // Return user without password
    return result;
  }

  /**
   * Generates a JWT access token and returns user information for authenticated login.
   *
   * @param user - User object without password
   * @returns LoginResponse containing access token and user details
   */
  login(user: Omit<User, "password">): LoginResponse {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Validates a JWT payload and retrieves the corresponding user from the database.
   *
   * @param payload - JWT payload
   * @returns User object without password if token is valid, null otherwise
   */
  async validateToken(
    payload: JwtPayload,
  ): Promise<Omit<User, "password"> | null> {
    if (!payload || typeof payload !== "object" || !payload.email) {
      return null;
    }

    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;

    // Return user without password
    return result;
  }
}
