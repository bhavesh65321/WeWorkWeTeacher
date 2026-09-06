import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import type { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const token = this.readToken(req);
    if (!token) throw new UnauthorizedException();
    try {
      const payload = this.jwt.verify(token);
      req.user = payload;

      // Check if user is blocked
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (user?.blockedAt) {
        throw new ForbiddenException("Your account has been blocked. Contact support.");
      }

      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException();
    }
  }

  private readToken(req: Request) {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.slice(7);
    const cookie = req.cookies?.wtws_token as string | undefined;
    return cookie;
  }
}
