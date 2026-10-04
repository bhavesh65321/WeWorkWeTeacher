import { Module } from "@nestjs/common";
import { FlagsService } from "./flags.service";
import { FlagsController } from "./flags.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [FlagsService],
  controllers: [FlagsController],
  exports: [FlagsService],
})
export class FlagsModule {}
