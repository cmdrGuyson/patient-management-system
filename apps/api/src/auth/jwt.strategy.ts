import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "./auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates and extracts user information from a JWT payload.
   *
   * @param payload - Decoded JWT payload containing user data
   * @returns User object if payload is valid, null otherwise
   */
  validate(payload: JwtPayload) {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    return {
      userId: payload.sub || null,
      email: payload.email || null,
      role: payload.role || null,
    };
  }
}
