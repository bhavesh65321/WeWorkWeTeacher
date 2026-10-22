import { Body, Controller, Get, Post, UseGuards, Request, ForbiddenException, Param } from "@nestjs/common";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { FlagsService } from "./flags.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

class CreateFlagDto {
  @IsIn(["JOB", "USER"])
  targetType: string;

  @IsString()
  @MinLength(1)
  targetId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

interface AuthRequest extends Request {
  user?: { sub: string; roles: string[] };
}

@Controller("flags")
export class FlagsController {
  constructor(private readonly flags: FlagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: AuthRequest, @Body() body: CreateFlagDto) {
    if (!req.user) throw new ForbiddenException();
    return this.flags.create(req.user.sub, body.targetType, body.targetId, body.reason, body.notes);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req: AuthRequest) {
    // Admin only
    await this.flags.assertAdmin(req.user!.sub);
    return this.flags.list("OPEN");
  }

  @Post(":id/dismiss")
  @UseGuards(JwtAuthGuard)
  async dismiss(@Request() req: AuthRequest, @Param("id") id: string) {
    await this.flags.assertAdmin(req.user!.sub);
    return this.flags.dismiss(id);
  }

  @Post(":id/resolve")
  @UseGuards(JwtAuthGuard)
  async resolve(@Request() req: AuthRequest, @Param("id") id: string) {
    await this.flags.assertAdmin(req.user!.sub);
    return this.flags.resolve(id);
  }

  @Post(":id/block")
  @UseGuards(JwtAuthGuard)
  async blockUser(@Request() req: AuthRequest, @Param("id") id: string, @Body() body?: { adminNote?: string }) {
    await this.flags.assertAdmin(req.user!.sub);
    return this.flags.blockUser(id, body?.adminNote);
  }
}
