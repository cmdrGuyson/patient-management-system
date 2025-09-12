import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
