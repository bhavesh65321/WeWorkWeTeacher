import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";

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

  async confirm(studentId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { conversation: true },
    });
    if (!booking || booking.studentId !== studentId) throw new ForbiddenException();
    if (booking.status !== "REQUESTED") throw new BadRequestException("Booking cannot be confirmed");
    
    await this.prisma.booking.update({ 
      where: { id: bookingId }, 
      data: { status: "CONFIRMED" } 
    });
    return { ok: true, status: "CONFIRMED" };
  }

  async complete(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new ForbiddenException();
    if (booking.studentId !== userId && booking.tutorId !== userId) throw new ForbiddenException();
    if (booking.status !== "CONFIRMED") throw new BadRequestException("Booking must be confirmed first");
    
    await this.prisma.booking.update({ 
      where: { id: bookingId }, 
      data: { status: "COMPLETED" } 
    });
    return { ok: true, status: "COMPLETED" };
  }

  async cancel(userId: string, bookingId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new ForbiddenException();
    if (booking.studentId !== userId && booking.tutorId !== userId) throw new ForbiddenException();
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      throw new BadRequestException("Cannot cancel this booking");
    }
    
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", disputeReason: reason?.slice(0, 500) },
    });
    return { ok: true, status: "CANCELLED" };
  }

  async review(studentId: string, bookingId: string, rating: number, body?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { review: true } });
    if (!booking || booking.studentId !== studentId) throw new ForbiddenException();
    if (booking.status !== "COMPLETED") throw new BadRequestException("Complete the session first");
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
      include: { conversation: true },
      orderBy: { startsAt: "desc" },
    });
  }
}
