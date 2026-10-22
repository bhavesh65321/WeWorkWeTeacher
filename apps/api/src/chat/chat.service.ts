import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { NotificationsService } from "../notifications/notifications.service";
import {
  EARLY_ACCESS_HOURS,
  STUDENT_MESSAGE_COST,
  UNREAD_REFUND_MS,
  containsContactLeak,
  currentCoinPrice,
  maskContact,
} from "../marketplace-rules";
import { track } from "../analytics";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly notifications: NotificationsService,
  ) {}

  async applyToJob(tutorId: string, jobId: string, intro: string) {
    const tutor = await this.prisma.user.findUnique({ where: { id: tutorId } });
    if (tutor?.blockedAt) {
      throw new ForbiddenException("Your account has been blocked. Contact support.");
    }
    const profile = await this.prisma.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile) throw new ForbiddenException("Enable tutor role first");
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "OPEN" || job.visibility !== "PUBLIC") {
      throw new NotFoundException("Job not found");
    }
    if (job.studentId === tutorId) throw new BadRequestException("You cannot apply to your own job");

    const existing = await this.prisma.jobApply.findUnique({
      where: { jobId_tutorId: { jobId, tutorId } },
    });
    if (existing) throw new ConflictException("Already applied");

    const premium = tutor?.premiumUntil && tutor.premiumUntil > new Date();
    const earlyUntil = new Date(job.createdAt.getTime() + EARLY_ACCESS_HOURS * 36e5);
    if (!premium && new Date() < earlyUntil) {
      throw new ForbiddenException("Premium tutors get 1 hour early access");
    }

    const price = currentCoinPrice(job.createdAt, job.applyCount);
    const threadKey = `${job.studentId}:${tutorId}:${jobId}`;
    const conversation = await this.claimConversation(
      { threadKey, jobId, studentId: job.studentId, tutorId, messages: { create: { senderId: tutorId, body: maskContact(intro) } } },
      () => new ConflictException("Already applied"),
    );
    if (price > 0) {
      await this.debitOrRelease(conversation.id, () =>
        this.wallet.debitCoins(tutorId, price, "APPLY", `Apply to job`, jobId),
      );
    }
    await this.prisma.jobApply.create({
      data: {
        jobId,
        tutorId,
        coinsSpent: price,
        conversationId: conversation.id,
      },
    });
    await this.prisma.job.update({ where: { id: jobId }, data: { applyCount: { increment: 1 } } });
    await this.notifications.create(
      job.studentId,
      "Tutor applied",
      `${tutor?.name ?? "A tutor"} applied to ${job.title}`,
      `/jobs/${jobId}`,
    );
    track("job_applied", tutorId, "TUTOR", { jobId, coinsSpent: price });
    track("chat_started", tutorId, "TUTOR", { conversationId: conversation.id });
    return { conversationId: conversation.id, coinsSpent: price };
  }

  async messageTutor(studentId: string, tutorUserId: string, intro: string) {
    if (studentId === tutorUserId) throw new BadRequestException("Cannot message yourself");
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (student?.blockedAt) {
      throw new ForbiddenException("Your account has been blocked. Contact support.");
    }
    const tutor = await this.prisma.tutorProfile.findUnique({ where: { userId: tutorUserId } });
    if (!tutor) throw new NotFoundException("Tutor not found");
    const threadKey = `${studentId}:${tutorUserId}:direct`;
    const existing = await this.prisma.conversation.findUnique({ where: { threadKey } });
    if (existing) return { conversationId: existing.id, coinsSpent: 0 };

    let conversation;
    try {
      conversation = await this.claimConversation(
        { threadKey, studentId, tutorId: tutorUserId, messages: { create: { senderId: studentId, body: maskContact(intro) } } },
        () => null,
      );
    } catch {
      const raced = await this.prisma.conversation.findUnique({ where: { threadKey } });
      if (raced) return { conversationId: raced.id, coinsSpent: 0 };
      throw new ConflictException("Could not start conversation");
    }
    await this.debitOrRelease(conversation.id, () =>
      this.wallet.debitCoins(studentId, STUDENT_MESSAGE_COST, "MESSAGE", "Message tutor", tutorUserId),
    );
    await this.notifications.create(
      tutorUserId,
      "New student message",
      `${student?.name ?? "A student"} wants to work with you`,
      `/inbox/${conversation.id}`,
    );
    track("chat_started", studentId, "STUDENT", { conversationId: conversation.id });
    return { conversationId: conversation.id, coinsSpent: STUDENT_MESSAGE_COST };
  }

  private async claimConversation(data: Prisma.ConversationUncheckedCreateInput, onDuplicate: () => Error | null) {
    try {
      return await this.prisma.conversation.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const duplicate = onDuplicate();
        if (duplicate) throw duplicate;
      }
      throw err;
    }
  }

  private async debitOrRelease(conversationId: string, debit: () => Promise<unknown>) {
    try {
      await debit();
    } catch (err) {
      await this.prisma.conversation.delete({ where: { id: conversationId } }).catch(() => undefined);
      throw err;
    }
  }

  async list(userId: string) {
    const threads = await this.prisma.conversation.findMany({
      where: { OR: [{ studentId: userId }, { tutorId: userId }] },
      include: {
        student: true,
        tutor: true,
        job: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return threads.map((t) => this.toThread(t, userId));
  }

  async get(userId: string, id: string) {
    const t = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        student: true,
        tutor: true,
        job: true,
        messages: { orderBy: { createdAt: "asc" } },
        bookings: { include: { review: true }, orderBy: { createdAt: "desc" } },
        apply: true,
      },
    });
    if (!t || (t.studentId !== userId && t.tutorId !== userId)) throw new NotFoundException();
    if (t.apply && t.studentId === userId && !t.apply.studentReadAt) {
      await this.prisma.jobApply.update({ where: { id: t.apply.id }, data: { studentReadAt: new Date() } });
    }

    const student = await this.prisma.user.findUnique({ where: { id: t.studentId } });
    const contactUnlocked = Boolean(t.contactUnlocked && student?.emailVerifiedAt && student?.phoneVerifiedAt);
    const unlockBlockers: ("COINS" | "EMAIL" | "PHONE")[] = [];
    if (!t.contactUnlocked) unlockBlockers.push("COINS");
    if (!student?.emailVerifiedAt) unlockBlockers.push("EMAIL");
    if (!student?.phoneVerifiedAt) unlockBlockers.push("PHONE");

    const masked = !t.contactUnlocked;
    return {
      ...this.toThread(t, userId),
      contactUnlocked,
      unlockBlockers,
      bookings: t.bookings,
      messages: t.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: masked ? maskContact(m.body) : m.body,
        createdAt: m.createdAt.toISOString(),
        mine: m.senderId === userId,
      })),
    };
  }

  async unlockContact(userId: string, conversationId: string) {
    const t = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!t || (t.studentId !== userId && t.tutorId !== userId)) throw new NotFoundException();
    if (t.contactUnlocked) return { ok: true, already: true };

    const UNLOCK_COST = 10;
    await this.wallet.debitCoins(userId, UNLOCK_COST, "UNLOCK", "Unlock contact", conversationId);
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { contactUnlocked: true },
    });
    track("contact_unlocked", userId, "STUDENT", { conversationId, coinsSpent: UNLOCK_COST });
    return { ok: true, coinsSpent: UNLOCK_COST };
  }

  async send(userId: string, conversationId: string, body: string) {
    const t = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { apply: true },
    });
    if (!t || (t.studentId !== userId && t.tutorId !== userId)) throw new NotFoundException();
    if (!t.contactUnlocked && containsContactLeak(body)) {
      throw new BadRequestException("Phone, email, and off-platform links stay hidden until contact is unlocked");
    }
    const stored = t.contactUnlocked ? body : maskContact(body);
    const msg = await this.prisma.message.create({
      data: { conversationId, senderId: userId, body: stored },
    });
    if (t.apply && t.studentId === userId && !t.apply.studentReadAt) {
      await this.prisma.jobApply.update({ where: { id: t.apply.id }, data: { studentReadAt: new Date() } });
    }
    return { id: msg.id, senderId: userId, body: stored, createdAt: msg.createdAt.toISOString(), mine: true };
  }

  async refundUnread() {
    const cutoff = new Date(Date.now() - UNREAD_REFUND_MS);
    const stale = await this.prisma.jobApply.findMany({
      where: { refundedAt: null, studentReadAt: null, coinsSpent: { gt: 0 }, createdAt: { lte: cutoff } },
    });
    for (const apply of stale) {
      await this.wallet.creditCoins(apply.tutorId, apply.coinsSpent, "REFUND", "Unread after 14 days", apply.id);
      await this.prisma.jobApply.update({ where: { id: apply.id }, data: { refundedAt: new Date() } });
    }
    return { refunded: stale.length };
  }

  async refundSpamJob(jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException("Job not found");
    const applies = await this.prisma.jobApply.findMany({
      where: { jobId, refundedAt: null, coinsSpent: { gt: 0 } },
    });
    for (const apply of applies) {
      await this.wallet.creditCoins(apply.tutorId, apply.coinsSpent, "REFUND", "Job marked spam", apply.id);
      await this.prisma.jobApply.update({ where: { id: apply.id }, data: { refundedAt: new Date() } });
    }
    await this.prisma.job.update({ where: { id: jobId }, data: { status: "CLOSED" } });
    return { refunded: applies.length };
  }

  private toThread(
    t: {
      id: string;
      studentId: string;
      tutorId: string;
      contactUnlocked: boolean;
      job: { title: string } | null;
      student: { name: string; phone: string | null };
      tutor: { name: string; phone: string | null };
      messages: { body: string; createdAt: Date }[];
    },
    userId: string,
  ) {
    const otherUser = userId === t.studentId ? t.tutor : t.student;
    const last = [...t.messages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return {
      id: t.id,
      otherName: otherUser.name,
      otherPhone: t.contactUnlocked ? otherUser.phone : null,
      isStudent: userId === t.studentId,
      jobTitle: t.job?.title ?? "Direct message",
      contactUnlocked: t.contactUnlocked,
      lastMessage: last ? (t.contactUnlocked ? last.body : maskContact(last.body)) : "",
      lastAt: last?.createdAt.toISOString() ?? null,
    };
  }
}
