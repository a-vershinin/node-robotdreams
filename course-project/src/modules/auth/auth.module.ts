import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { TokensService } from "./services/tokens.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "secret",
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokensService],
  exports: [AuthService, TokensService, JwtModule],
})
export class AuthModule {}
