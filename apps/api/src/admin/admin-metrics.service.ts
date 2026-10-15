import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type DayBucket = { date: string; count: number; amountMinor?: number };

function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysAgo(n: number) {
  const d = startOfUtcDay(new Date());
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function emptyDaySeries(days: number): DayBucket[] {
  return Array.from({ length: days }, (_, i) => ({
    date: dateKey(daysAgo(days - 1 - i)),
    count: 0,
    amountMinor: 0,
  }));
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

@Injectable()
export class AdminMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const now = new Date();
    const d7 = daysAgo(7);
    const d30 = daysAgo(30);
    const d60 = daysAgo(60);

    const [
      totalUsers,
      students,
      tutors,
      publishedTutors,
      newUsers7d,
      newUsers30d,
      newUsersPrev30d,
      activeUsers7d,
      activeUsers30d,
      premiumUsers,
      referredUsers,
      revenueAll,
      revenue7d,
      revenue30d,
      revenuePrev30d,
      payingUsers,
      jobsTotal,
      jobsOpen,
      jobs30d,
      jobsPrev30d,
      applies30d,
      appliesPrev30d,
      bookings30d,
      conversations30d,
      contactUnlocks,
      openFlags,
      openTickets,
      recentUsers,
      recentPayments,
      recentJobs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.studentProfile.count(),
      this.prisma.tutorProfile.count(),
      this.prisma.tutorProfile.count({ where: { isPublished: true } }),
      this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: d7 } } }),
      this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: d30 } } }),
      this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: d60, lt: d30 } } }),
      this.prisma.user.count({ where: { deletedAt: null, lastSeenAt: { gte: d7 } } }),
      this.prisma.user.count({ where: { deletedAt: null, lastSeenAt: { gte: d30 } } }),
      this.prisma.user.count({ where: { deletedAt: null, premiumUntil: { gt: now } } }),
      this.prisma.user.count({ where: { deletedAt: null, referredById: { not: null } } }),
      this.prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amountMinor: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: d7 } },
        _sum: { amountMinor: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: d30 } },
        _sum: { amountMinor: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: d60, lt: d30 } },
        _sum: { amountMinor: true },
        _count: true,
      }),
      this.prisma.payment.findMany({
        where: { status: "PAID" },
        select: { userId: true },
        distinct: ["userId"],
      }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: "OPEN" } }),
      this.prisma.job.count({ where: { createdAt: { gte: d30 } } }),
      this.prisma.job.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
      this.prisma.jobApply.count({ where: { createdAt: { gte: d30 } } }),
      this.prisma.jobApply.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: d30 } } }),
      this.prisma.conversation.count({ where: { createdAt: { gte: d30 } } }),
      this.prisma.conversation.count({ where: { contactUnlocked: true } }),
      this.prisma.flag.count({ where: { status: "OPEN" } }),
      this.prisma.supportTicket.count({ where: { status: "OPEN" } }),
      this.prisma.user.findMany({
        where: { deletedAt: null, createdAt: { gte: d30 } },
        select: { createdAt: true },
      }),
      this.prisma.payment.findMany({
        where: { status: "PAID", paidAt: { gte: d30 } },
        select: { paidAt: true, amountMinor: true },
      }),
      this.prisma.job.findMany({
        where: { createdAt: { gte: d30 } },
        select: { createdAt: true },
      }),
    ]);

    const signupSeries = emptyDaySeries(30);
    const revenueSeries = emptyDaySeries(30);
    const jobSeries = emptyDaySeries(30);
    const signupIndex = new Map(signupSeries.map((b, i) => [b.date, i]));

    for (const u of recentUsers) {
      const key = dateKey(u.createdAt);
      const i = signupIndex.get(key);
      if (i != null) signupSeries[i].count += 1;
    }
    for (const p of recentPayments) {
      if (!p.paidAt) continue;
      const key = dateKey(p.paidAt);
      const i = signupIndex.get(key);
      if (i != null) {
        revenueSeries[i].count += 1;
        revenueSeries[i].amountMinor = (revenueSeries[i].amountMinor ?? 0) + p.amountMinor;
      }
    }
    for (const j of recentJobs) {
      const key = dateKey(j.createdAt);
      const i = signupIndex.get(key);
      if (i != null) jobSeries[i].count += 1;
    }

    const revenueTotal = revenueAll._sum.amountMinor ?? 0;
    const revenue30 = revenue30d._sum.amountMinor ?? 0;
    const revenue7 = revenue7d._sum.amountMinor ?? 0;
    const revenuePrev30 = revenuePrev30d._sum.amountMinor ?? 0;
    const paidOrders = revenueAll._count;
    const payingUserCount = payingUsers.length;

    return {
      generatedAt: now.toISOString(),
      users: {
        total: totalUsers,
        students,
        tutors,
        publishedTutors,
        new7d: newUsers7d,
        new30d: newUsers30d,
        new30dChangePct: pctChange(newUsers30d, newUsersPrev30d),
        active7d: activeUsers7d,
        active30d: activeUsers30d,
        premium: premiumUsers,
        referred: referredUsers,
        paying: payingUserCount,
        conversionPct: totalUsers === 0 ? 0 : Math.round((payingUserCount / totalUsers) * 1000) / 10,
      },
      revenue: {
        currency: "INR",
        totalMinor: revenueTotal,
        last7dMinor: revenue7,
        last30dMinor: revenue30,
        last30dChangePct: pctChange(revenue30, revenuePrev30),
        paidOrders,
        paidOrders30d: revenue30d._count,
        paidOrders7d: revenue7d._count,
        avgOrderMinor: paidOrders === 0 ? 0 : Math.round(revenueTotal / paidOrders),
      },
      marketplace: {
        jobsTotal,
        jobsOpen,
        jobs30d,
        jobs30dChangePct: pctChange(jobs30d, jobsPrev30d),
        applies30d,
        applies30dChangePct: pctChange(applies30d, appliesPrev30d),
        bookings30d,
        conversations30d,
        contactUnlocks,
      },
      health: {
        openFlags,
        openTickets,
      },
      series: {
        signups30d: signupSeries.map(({ date, count }) => ({ date, count })),
        revenue30d: revenueSeries.map(({ date, count, amountMinor }) => ({
          date,
          count,
          amountMinor: amountMinor ?? 0,
        })),
        jobs30d: jobSeries.map(({ date, count }) => ({ date, count })),
      },
      windows: {
        comparedTo: "previous 30 days",
      },
    };
  }
}
