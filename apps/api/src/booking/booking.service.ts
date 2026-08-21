import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { platformFee } from "../marketplace-rules";

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
  ) {}

  async create(studentId: string, conversationId: string, startsAt: string, durationMin: number) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { tutor: { include: { tutorProfile: true } } },
    });
    if (!convo || convo.studentId !== studentId) throw new ForbiddenException();
    const rate = convo.tutor.tutorProfile?.hourlyRateMinor ?? 3000;
    const hours = Math.max(durationMin, 30) / 60;
    const amountMinor = Math.round(rate * hours);
    return this.prisma.booking.create({
      data: {
        conversationId,
        studentId,
        tutorId: convo.tutorId,
        startsAt: new Date(startsAt),
        durationMin,
        amountMinor,
        status: "REQUESTED",
      },
    });
  }

  async paySandbox(studentId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { escrow: true, conversation: true },
    });
    if (!booking || booking.studentId !== studentId) throw new ForbiddenException();
    if (booking.escrow) throw new BadRequestException("Already funded");
    if (booking.status !== "REQUESTED") throw new BadRequestException("Booking cannot be paid");
    await this.prisma.$transaction([
      this.prisma.escrowHold.create({
        data: { bookingId, amountMinor: booking.amountMinor, status: "HELD" },
      }),
      this.prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } }),
      this.prisma.conversation.update({
        where: { id: booking.conversationId },
        data: { escrowFunded: true },
      }),
    ]);
    return { ok: true, status: "HELD" };
  }

  async release(studentId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { escrow: true },
    });
    if (!booking || booking.studentId !== studentId) throw new ForbiddenException();
    if (booking.status === "DISPUTED") throw new BadRequestException("This session is in dispute");
    if (!booking.escrow || booking.escrow.status !== "HELD") throw new BadRequestException("Nothing to release");
    const fee = platformFee(booking.amountMinor);
    const net = booking.amountMinor - fee;
    await this.prisma.$transaction([
      this.prisma.escrowHold.update({
        where: { id: booking.escrow.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      }),
      this.prisma.booking.update({ where: { id: bookingId }, data: { status: "COMPLETED" } }),
    ]);
    await this.wallet.creditFiat(booking.tutorId, net, "ESCROW_RELEASE", `Session payout (fee ${fee})`, bookingId);
    return { ok: true, netMinor: net, feeMinor: fee };
  }

  async dispute(studentId: string, bookingId: string, reason: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { escrow: true } });
    if (!booking || booking.studentId !== studentId) throw new ForbiddenException();
    if (!booking.escrow || booking.escrow.status !== "HELD") throw new BadRequestException("Nothing to dispute");
    if (booking.disputedAt) throw new BadRequestException("Already disputed");
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { disputedAt: new Date(), disputeReason: reason.slice(0, 500), status: "DISPUTED" },
    });
  }

  async refundDispute(adminNote: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { escrow: true } });
    if (!booking?.escrow || (booking.escrow.status !== "HELD" && booking.status !== "DISPUTED")) {
      throw new BadRequestException("No held escrow to refund");
    }
    await this.prisma.$transaction([
      this.prisma.escrowHold.update({
        where: { id: booking.escrow.id },
        data: { status: "REFUNDED", releasedAt: new Date() },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "REFUNDED", disputeReason: adminNote || booking.disputeReason },
      }),
    ]);
    return { ok: true };
  }

  async review(studentId: string, bookingId: string, rating: number, body?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { review: true } });
    if (!booking || booking.studentId !== studentId) throw new ForbiddenException();
    if (booking.status !== "COMPLETED") throw new BadRequestException("Finish the session first");
    if (booking.review) throw new BadRequestException("Already reviewed");
    if (rating < 1 || rating > 5) throw new BadRequestException("Rating 1–5");
    const review = await this.prisma.review.create({
      data: { bookingId, fromId: studentId, toId: booking.tutorId, rating, body },
    });
    const stats = await this.prisma.review.aggregate({
      where: { toId: booking.tutorId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.tutorProfile.updateMany({
      where: { userId: booking.tutorId },
      data: { ratingAvg: stats._avg.rating ?? rating, reviewCount: stats._count },
    });
    return review;
  }

  async listReviews(userId: string) {
    const [given, received] = await Promise.all([
      this.prisma.review.findMany({
        where: { fromId: userId },
        include: { to: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      this.prisma.review.findMany({
        where: { toId: userId },
        include: { from: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
    return {
      given: given.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        name: r.to.name.split(" ")[0],
      })),
      received: received.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        name: r.from.name.split(" ")[0],
      })),
    };
  }

  async mine(userId: string) {
    return this.prisma.booking.findMany({
      where: { OR: [{ studentId: userId }, { tutorId: userId }] },
      include: { escrow: true, conversation: true },
      orderBy: { startsAt: "desc" },
    });
  }
}
