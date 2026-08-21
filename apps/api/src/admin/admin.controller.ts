import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsInt, IsString, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { ChatService } from "../chat/chat.service";
import { BookingService } from "../booking/booking.service";
import { asStringArray } from "../json-list";

class FlagDto {
  @IsString()
  targetType: string;

  @IsString()
  targetId: string;

  @IsString()
  @MinLength(8)
  reason: string;
}

class RefundDto {
  @IsString()
  userId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  coins: number;

  @IsString()
  note: string;
}

@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly chat: ChatService,
    private readonly bookings: BookingService,
  ) {}

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !asStringArray(user.roles).includes("ADMIN")) throw new ForbiddenException();
  }

  @Get("overview")
  async overview(@CurrentUser() user: AuthUser) {
    await this.assertAdmin(user.sub);
    const [users, jobs, flags, holds, tickets] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.job.count(),
      this.prisma.flag.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 50 }),
      this.prisma.escrowHold.findMany({ take: 30, orderBy: { createdAt: "desc" }, include: { booking: true } }),
      this.prisma.supportTicket.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 50 }),
    ]);
    return { users, jobs, flags, holds, tickets };
  }

  @Post("flags")
  async flag(@CurrentUser() user: AuthUser, @Body() dto: FlagDto) {
    return this.prisma.flag.create({
      data: {
        reporterId: user.sub,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
      },
    });
  }

  @Post("flags/:id/resolve")
  async resolve(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    await this.assertAdmin(user.sub);
    return this.prisma.flag.update({ where: { id }, data: { status: "RESOLVED" } });
  }

  @Post("refund-unread")
  async refundUnread(@CurrentUser() user: AuthUser) {
    await this.assertAdmin(user.sub);
    return this.chat.refundUnread();
  }

  @Post("tickets/:id/close")
  async closeTicket(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() body: { note?: string }) {
    await this.assertAdmin(user.sub);
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: "CLOSED", adminNote: body.note },
    });
  }

  @Post("bookings/:id/refund")
  async refundBooking(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() body: { note?: string }) {
    await this.assertAdmin(user.sub);
    return this.bookings.refundDispute(body.note || "Admin refund", id);
  }

  @Post("jobs/:id/spam")
  async spamJob(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    await this.assertAdmin(user.sub);
    return this.chat.refundSpamJob(id);
  }

  @Post("credit")
  async credit(@CurrentUser() user: AuthUser, @Body() dto: RefundDto) {
    await this.assertAdmin(user.sub);
    await this.wallet.creditCoins(dto.userId, Number(dto.coins), "ADMIN", dto.note);
    return { ok: true };
  }
}
