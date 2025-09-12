import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, User } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address to search for
   * @returns User object if found, null otherwise
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Finds a user by their unique ID.
   *
   * @param id - The user ID to search for
   * @returns User object if found, null otherwise
   */
  async findOneById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Creates a new user
   *
   * @param data - User creation data
   * @returns User object without password
   * @throws ConflictException if user with email already exists
   */
  async create(data: Prisma.UserCreateInput): Promise<Omit<User, "password">> {
    // Check if user already exists
    const existingUser = await this.findOneByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;

    // Return user without password
    return result;
  }
}
