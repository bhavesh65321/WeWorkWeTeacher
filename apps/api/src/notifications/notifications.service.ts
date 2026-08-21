import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, title: string, body: string, href?: string) {
    return this.prisma.notification.create({ data: { userId, title, body, href } });
  }

  async list(userId: string, filter?: "unread" | "read") {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(filter === "unread" ? { readAt: null } : {}),
        ...(filter === "read" ? { readAt: { not: null } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(userId: string, id?: string) {
    if (id) {
      await this.prisma.notification.updateMany({
        where: { id, userId, readAt: null },
        data: { readAt: new Date() },
      });
    } else {
      await this.prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      });
    }
    return { ok: true };
  }
}
