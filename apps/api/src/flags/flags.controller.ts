import { Body, Controller, Get, Post, UseGuards, Request, ForbiddenException, Param } from "@nestjs/common";
import { FlagsService } from "./flags.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

interface AuthRequest extends Request {
  user?: { id: string; roles: string[] };
}

@Controller("flags")
export class FlagsController {
  constructor(private readonly flags: FlagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: AuthRequest, @Body() body: { targetType: string; targetId: string; reason: string; notes?: string }) {
    if (!req.user) throw new ForbiddenException();
    return this.flags.create(req.user.id, body.targetType, body.targetId, body.reason, body.notes);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req: AuthRequest) {
    // Admin only
    if (!req.user?.roles.includes("ADMIN")) {
      throw new ForbiddenException("Admin only");
    }
    return this.flags.list("OPEN");
  }

  @Post(":id/dismiss")
  @UseGuards(JwtAuthGuard)
  async dismiss(@Request() req: AuthRequest, @Param("id") id: string) {
    if (!req.user?.roles.includes("ADMIN")) {
      throw new ForbiddenException("Admin only");
    }
    return this.flags.dismiss(id);
  }

  @Post(":id/resolve")
  @UseGuards(JwtAuthGuard)
  async resolve(@Request() req: AuthRequest, @Param("id") id: string) {
    if (!req.user?.roles.includes("ADMIN")) {
      throw new ForbiddenException("Admin only");
    }
    return this.flags.resolve(id);
  }

  @Post(":id/block")
  @UseGuards(JwtAuthGuard)
  async blockUser(@Request() req: AuthRequest, @Param("id") id: string, @Body() body?: { adminNote?: string }) {
    if (!req.user?.roles.includes("ADMIN")) {
      throw new ForbiddenException("Admin only");
    }
    return this.flags.blockUser(id, body?.adminNote);
  }
}
