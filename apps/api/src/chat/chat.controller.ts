import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { ChatService } from "./chat.service";

class ApplyJobDto {
  @IsString()
  @MinLength(12)
  @MaxLength(2000)
  message: string;
}

class SendDto {
  @IsString()
  @Matches(/\S/, { message: "Message cannot be empty" })
  @MaxLength(2000)
  body: string;
}

class MessageTutorDto extends ApplyJobDto {
  @IsString()
  tutorUserId: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post("jobs/:id/apply")
  apply(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: ApplyJobDto) {
    return this.chat.applyToJob(user.sub, id, dto.message);
  }

  @Post("tutors/message")
  messageTutor(@CurrentUser() user: AuthUser, @Body() dto: MessageTutorDto) {
    return this.chat.messageTutor(user.sub, dto.tutorUserId, dto.message);
  }

  @Get("conversations")
  list(@CurrentUser() user: AuthUser) {
    return this.chat.list(user.sub);
  }

  @Get("conversations/:id")
  get(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.chat.get(user.sub, id);
  }

  @Post("conversations/:id/messages")
  send(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: SendDto) {
    return this.chat.send(user.sub, id, dto.body);
  }

  @Post("conversations/:id/unlock")
  unlock(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.chat.unlockContact(user.sub, id);
  }
}
