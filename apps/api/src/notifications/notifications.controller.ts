import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query("filter") filter?: "unread" | "read") {
    return this.notifications.list(user.sub, filter);
  }

  @Post("read")
  readAll(@CurrentUser() user: AuthUser) {
    return this.notifications.markRead(user.sub);
  }

  @Post(":id/read")
  readOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.notifications.markRead(user.sub, id);
  }
}
