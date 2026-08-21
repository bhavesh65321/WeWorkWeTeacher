import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type AuthUser = {
  sub: string;
  email: string;
  activeRole: string;
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
  return req.user;
});
