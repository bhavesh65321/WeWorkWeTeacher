import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request & { user?: { sub: string } }>();
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : (req.cookies?.wtws_token as string | undefined);
    if (!token) return true;
    try {
      req.user = this.jwt.verify(token) as { sub: string };
    } catch {
      /* public access still allowed */
    }
    return true;
  }
}
