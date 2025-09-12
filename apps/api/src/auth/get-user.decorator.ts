import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { JwtUser } from "./auth.types";

export const GetUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const { user }: { user: JwtUser } = context.switchToHttp().getRequest();
    return user;
  },
);
