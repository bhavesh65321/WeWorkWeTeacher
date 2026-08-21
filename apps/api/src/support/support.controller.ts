import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { OptionalJwtGuard } from "../auth/optional-jwt.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";

class CreateTicketDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  topic: string;

  @IsString()
  @MinLength(10)
  body: string;
}

@Controller("support")
export class SupportController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseGuards(OptionalJwtGuard)
  create(@Body() dto: CreateTicketDto, @CurrentUser() user?: AuthUser) {
    return this.prisma.supportTicket.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase(),
        topic: dto.topic.trim(),
        body: dto.body.trim(),
        userId: user?.sub ?? null,
      },
    });
  }
}
