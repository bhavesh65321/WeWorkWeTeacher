import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtGuard } from "./optional-jwt.guard";
import { OtpService } from "./otp.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") ?? "change-me-in-dev",
        signOptions: { expiresIn: 60 * 60 * 24 * 7 },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtAuthGuard, OptionalJwtGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, OptionalJwtGuard],
})
export class AuthModule {}
