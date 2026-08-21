import { Module } from "@nestjs/common";
import { TutorsService } from "./tutors.service";
import { TutorsController } from "./tutors.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [TutorsController],
  providers: [TutorsService],
})
export class TutorsModule {}
