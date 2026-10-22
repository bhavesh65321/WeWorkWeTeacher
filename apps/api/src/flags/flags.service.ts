import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { track } from "../analytics";
import { asStringArray } from "../json-list";

@Injectable()
export class FlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !asStringArray(user.roles).includes("ADMIN")) throw new ForbiddenException("Admin only");
  }

  async create(reporterId: string, targetType: string, targetId: string, reason: string, notes?: string) {
    const reporter = await this.prisma.user.findUnique({ where: { id: reporterId } });
    if (reporter?.blockedAt) {
      throw new ForbiddenException("Your account has been blocked. Contact support.");
    }

    // Prevent self-reporting
    if (targetType === "USER" && targetId === reporterId) {
      throw new BadRequestException("You can't report your own post");
    }
    if (targetType === "JOB") {
      const job = await this.prisma.job.findUnique({ where: { id: targetId } });
      if (!job) throw new NotFoundException("Job not found");
      if (job.studentId === reporterId) {
        throw new BadRequestException("You can't report your own post");
      }
    }

    if (targetType === "USER") {
      const target = await this.prisma.user.findUnique({ where: { id: targetId } });
      if (!target) throw new NotFoundException("User not found");
    }

    // Check 3 flags per 24h limit
    const dayAgo = new Date(Date.now() - 24 * 36e5);
    const recentFlags = await this.prisma.flag.count({
      where: {
        reporterId,
        targetType,
        targetId,
        createdAt: { gte: dayAgo },
      },
    });
    if (recentFlags >= 3) {
      throw new BadRequestException("You've reported this too many times. Please try again later.");
    }

    const flag = await this.prisma.flag.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason,
        notes: notes?.slice(0, 500),
        status: "OPEN",
      },
    });

    track("report_submitted", reporterId, "STUDENT", {
      flagId: flag.id,
      targetType,
      targetId,
      reason,
    });

    return flag;
  }

  async list(filter?: "OPEN" | "DISMISSED" | "RESOLVED") {
    return this.prisma.flag.findMany({
      where: filter ? { status: filter } : {},
      include: { reporter: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async dismiss(flagId: string) {
    return this.prisma.flag.update({
      where: { id: flagId },
      data: { status: "DISMISSED" },
    });
  }

  async resolve(flagId: string) {
    return this.prisma.flag.update({
      where: { id: flagId },
      data: { status: "RESOLVED" },
    });
  }

  async blockUser(flagId: string, adminNote?: string) {
    const flag = await this.prisma.flag.findUnique({ where: { id: flagId } });
    if (!flag) throw new NotFoundException("Flag not found");

    let userIdToBlock: string | null = null;
    if (flag.targetType === "USER") {
      userIdToBlock = flag.targetId;
    } else if (flag.targetType === "JOB") {
      const job = await this.prisma.job.findUnique({ where: { id: flag.targetId } });
      if (job) userIdToBlock = job.studentId;
    }

    if (!userIdToBlock) throw new BadRequestException("Cannot determine user to block");

    // Block user
    await this.prisma.user.update({
      where: { id: userIdToBlock },
      data: { blockedAt: new Date(), blockReason: adminNote },
    });

    // Close all OPEN jobs for this user
    await this.prisma.job.updateMany({
      where: { studentId: userIdToBlock, status: "OPEN" },
      data: { status: "CLOSED" },
    });

    // Resolve related open flags
    await this.prisma.flag.updateMany({
      where: {
        OR: [{ targetId: userIdToBlock, targetType: "USER" }, { targetId: { in: await this.getJobIds(userIdToBlock) }, targetType: "JOB" }],
        status: "OPEN",
      },
      data: { status: "RESOLVED" },
    });

    // Update current flag
    await this.prisma.flag.update({
      where: { id: flagId },
      data: { status: "RESOLVED" },
    });

    track("user_blocked", undefined, "ADMIN", {
      userId: userIdToBlock,
      flagId,
      reason: adminNote,
    });

    return { ok: true };
  }

  private async getJobIds(studentId: string): Promise<string[]> {
    const jobs = await this.prisma.job.findMany({
      where: { studentId },
      select: { id: true },
    });
    return jobs.map((j) => j.id);
  }
}
