import { ConflictException, ForbiddenException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { JobStatus, JobType, JobVisibility, Prisma, TeachingMode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { asStringArray, jsonList } from "../json-list";
import {
  EARLY_ACCESS_HOURS,
  MAX_JOBS_PER_DAY,
  currentCoinPrice,
  extractContacts,
  isJobMatch,
  maskContact,
} from "../marketplace-rules";
import { MIN_REQUIREMENT_WORDS, containsProfanity, countWords, skillError } from "../content-rules";
import { NotificationsService } from "../notifications/notifications.service";
import { EmailService } from "../notifications/email.service";
import { track } from "../analytics";

function assertValidJobContent(dto: Partial<CreateJobDto>) {
  if (dto.description !== undefined && countWords(dto.description) < MIN_REQUIREMENT_WORDS) {
    throw new BadRequestException(`Describe your requirement in at least ${MIN_REQUIREMENT_WORDS} words.`);
  }
  if (dto.description !== undefined && containsProfanity(dto.description)) {
    throw new BadRequestException("Please use appropriate language in your requirement.");
  }
  if (dto.subject !== undefined) {
    const error = dto.subject.split(",").map(skillError).find(Boolean);
    if (error) throw new BadRequestException(error);
  }
  const hasPaidBudget = dto.budgetType !== undefined && dto.budgetType !== "FREE";
  if (hasPaidBudget && (!dto.budgetMin || !dto.budgetMax)) {
    throw new BadRequestException("Enter your budget range or choose Free.");
  }
  if (dto.budgetMin && dto.budgetMax && dto.budgetMin > dto.budgetMax) {
    throw new BadRequestException("Budget 'from' can't be higher than 'to'.");
  }
}

function hiddenContactFor(dto: Partial<CreateJobDto>) {
  const contacts = extractContacts(`${dto.title ?? ""}\n${dto.description ?? ""}`);
  return contacts.length ? contacts.join(", ") : null;
}

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
  ) {}

  async list(
    query: { mode?: string; subject?: string; type?: string; city?: string; q?: string; matched?: string; level?: string },
    viewerId?: string,
  ) {
    if (query.type && !Object.values(JobType).includes(query.type as JobType)) return [];
    const jobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.OPEN,
        visibility: JobVisibility.PUBLIC,
        ...(query.type ? { type: query.type as never } : {}),
        ...(query.city ? { city: { contains: query.city, mode: "insensitive" } } : {}),
        ...(query.level ? { level: { equals: query.level, mode: "insensitive" } } : {}),
        ...(query.subject ? { subject: { contains: query.subject, mode: "insensitive" } } : {}),
        ...(query.q
          ? {
              OR: [
                { title: { contains: query.q, mode: "insensitive" } },
                { description: { contains: query.q, mode: "insensitive" } },
                { subject: { contains: query.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { student: true },
      orderBy: { createdAt: "desc" },
      take: 80,
    });

    let tutorProfile = null;
    if (query.matched === "1" && viewerId) {
      tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId: viewerId } });
    }

    return jobs
      .filter((j) => {
        const modes = asStringArray(j.modes);
        if (query.mode && query.mode !== "ALL" && !modes.includes(query.mode)) return false;
        if (query.subject && !j.subject.toLowerCase().split(",").map((part) => part.trim()).includes(query.subject.toLowerCase())) return false;
        if (query.city && !(j.city ?? "").toLowerCase().includes(query.city.toLowerCase())) return false;
        if (query.level && (j.level ?? "").toLowerCase() !== query.level.toLowerCase()) return false;
        if (query.q) {
          const hay = `${j.title} ${j.description} ${j.subject}`.toLowerCase();
          if (!hay.includes(query.q.toLowerCase())) return false;
        }
        if (query.matched === "1" && tutorProfile) {
          const result = isJobMatch(
            {
              skills: asStringArray(tutorProfile.skills),
              subjects: asStringArray(tutorProfile.subjects),
              languages: asStringArray(tutorProfile.languages),
              modes: asStringArray(tutorProfile.modes),
            },
            {
              subject: j.subject,
              languages: asStringArray(j.languages),
              modes: asStringArray(j.modes),
            },
          );
          if (!result.match) return false;
        }
        return true;
      })
      .slice(0, 50)
      .map((j) => this.toCard(j));
  }

  async get(id: string, viewerId?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { student: true, applies: true },
    });
    if (!job) throw new NotFoundException("Job not found");
    const isOwner = viewerId === job.studentId;
    if (job.visibility === JobVisibility.PRIVATE && !isOwner) throw new NotFoundException("Job not found");
    const apply = viewerId ? job.applies.find((a) => a.tutorId === viewerId) : undefined;
    const earlyUntil = new Date(job.createdAt.getTime() + EARLY_ACCESS_HOURS * 36e5);
    let isPremium = false;
    if (viewerId) {
      const viewer = await this.prisma.user.findUnique({ where: { id: viewerId } });
      isPremium = Boolean(viewer?.premiumUntil && viewer.premiumUntil > new Date());
    }
    const canSeeContact = isOwner || Boolean(apply && !apply.refundedAt);
    return {
      ...this.toCard(job),
      hiddenContact: canSeeContact ? job.hiddenContact : null,
      isOwner,
      coinPrice: currentCoinPrice(job.createdAt, job.applyCount),
      applyCount: job.applyCount,
      alreadyApplied: Boolean(apply),
      conversationId: apply?.conversationId ?? null,
      earlyAccessUntil: earlyUntil.toISOString(),
      earlyAccessActive: !isOwner && !isPremium && new Date() < earlyUntil && job.status === JobStatus.OPEN,
    };
  }

  async applicants(studentId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applies: {
          include: { tutor: { include: { tutorProfile: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!job) throw new NotFoundException("Job not found");
    if (job.studentId !== studentId) throw new ForbiddenException();
    return job.applies.map((a) => ({
      tutorName: a.tutor.name,
      tutorSlug: a.tutor.tutorProfile?.slug ?? null,
      conversationId: a.conversationId,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  async setStatus(studentId: string, jobId: string, status: JobStatus) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException("Job not found");
    if (job.studentId !== studentId) throw new ForbiddenException();
    const updated = await this.prisma.job.update({
      where: { id: jobId },
      data: { status },
      include: { student: true },
    });
    return this.toCard(updated);
  }

  async create(studentId: string, dto: CreateJobDto) {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (student?.blockedAt) {
      throw new ForbiddenException("Your account has been blocked. Contact support.");
    }
    assertValidJobContent(dto);
    const dayAgo = new Date(Date.now() - 24 * 36e5);
    const postedToday = await this.prisma.job.count({
      where: { studentId, createdAt: { gte: dayAgo } },
    });
    if (postedToday >= MAX_JOBS_PER_DAY) throw new ConflictException("Daily job limit reached");
    const dup = await this.prisma.job.findFirst({
      where: { studentId, title: dto.title, status: JobStatus.OPEN },
    });
    if (dup) throw new ConflictException("You already have an open job with this title");
    const job = await this.prisma.job.create({
      data: {
        studentId,
        title: maskContact(dto.title),
        description: maskContact(dto.description),
        hiddenContact: hiddenContactFor(dto),
        type: dto.type,
        modes: jsonList(dto.modes),
        languages: jsonList(dto.languages ?? []),
        visibility: dto.visibility,
        subject: dto.subject,
        level: dto.level,
        city: dto.city,
        country: dto.country,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        whenNeeded: dto.whenNeeded ?? "FLEXIBLE",
        frequency: dto.frequency ?? "WEEKLY",
        budgetType: dto.budgetType ?? "HOURLY",
        genderPref: dto.genderPref ?? "ANY",
        currency: dto.currency ?? "USD",
      },
      include: { student: true },
    });
    await this.notifyMatchingTutors(job.id, job.title, job.subject, studentId);
    track("job_posted", studentId, "STUDENT", { jobId: job.id, subject: job.subject });
    return this.toCard(job);
  }

  async update(studentId: string, jobId: string, dto: Partial<CreateJobDto>) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException("Job not found");
    if (job.studentId !== studentId) throw new ForbiddenException();
    assertValidJobContent(dto);
    const hiddenContact = this.hiddenContactUpdate(dto);
    const updated = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        title: dto.title === undefined ? undefined : maskContact(dto.title),
        description: dto.description === undefined ? undefined : maskContact(dto.description),
        hiddenContact,
        type: dto.type,
        modes: dto.modes ? jsonList(dto.modes) : undefined,
        languages: dto.languages ? jsonList(dto.languages) : undefined,
        visibility: dto.visibility,
        subject: dto.subject,
        level: dto.level,
        city: dto.city,
        country: dto.country,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        whenNeeded: dto.whenNeeded,
        frequency: dto.frequency,
        budgetType: dto.budgetType,
        genderPref: dto.genderPref,
        currency: dto.currency,
      },
      include: { student: true },
    });
    return this.toCard(updated);
  }

  private hiddenContactUpdate(dto: Partial<CreateJobDto>) {
    if (dto.description === undefined && dto.title === undefined) return undefined;
    const found = hiddenContactFor(dto);
    if (found) return found;
    const stillMasked = /\[hidden (email|number|link|app)\]/.test(`${dto.title ?? ""} ${dto.description ?? ""}`);
    return stillMasked ? undefined : null;
  }

  private async notifyMatchingTutors(jobId: string, title: string, subject: string, studentId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, subject: true, city: true, languages: true, modes: true },
    });
    if (!job) return;

    const tutors = await this.prisma.tutorProfile.findMany({
      where: { isPublished: true, notifyMatching: true, userId: { not: studentId } },
      include: { user: true },
      take: 80,
    });

    const matchedTutors = tutors
      .map((t) => ({
        tutor: t,
        result: isJobMatch(
          {
            skills: asStringArray(t.skills),
            subjects: asStringArray(t.subjects),
            languages: asStringArray(t.languages),
            modes: asStringArray(t.modes),
          },
          {
            subject: job.subject,
            languages: asStringArray(job.languages),
            modes: asStringArray(job.modes),
          },
        ),
      }))
      .filter((m) => m.result.match)
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, 50);

    if (!matchedTutors.length) return;

    for (const { tutor } of matchedTutors) {
      if (tutor.user.blockedAt) continue;

      const existing = await this.prisma.notification.findFirst({
        where: {
          userId: tutor.userId,
          title: "New job matching your skills",
          href: `/jobs/${jobId}`,
        },
      });
      if (!existing) {
        await this.prisma.notification.create({
          data: {
            userId: tutor.userId,
            title: "New job matching your skills",
            body: title,
            href: `/jobs/${jobId}`,
          },
        });

        this.email
          .sendMatchNotification(tutor.userId, tutor.user.email, {
            id: job.id,
            title: job.title,
            subject: job.subject,
            city: job.city,
            modes: asStringArray(job.modes),
          })
          .catch(() => undefined);
      }
    }

    track("match_notified", undefined, undefined, {
      jobId,
      matchCount: matchedTutors.length,
      tutorIds: matchedTutors.map((m) => m.tutor.userId),
    });
  }

  async mine(studentId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { studentId },
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });
    return jobs.map((j) => this.toCard(j));
  }

  private toCard(j: {
    id: string;
    title: string;
    description: string;
    type: string;
    modes: Prisma.JsonValue;
    languages: Prisma.JsonValue;
    visibility: string;
    subject: string;
    level: string | null;
    city: string | null;
    country: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    currency: string;
    whenNeeded: string;
    frequency: string;
    budgetType: string;
    genderPref: string;
    status: string;
    applyCount: number;
    createdAt: Date;
    student: { name: string };
  }) {
    return {
      id: j.id,
      title: j.title,
      description: j.description,
      type: j.type,
      modes: asStringArray(j.modes) as TeachingMode[],
      languages: asStringArray(j.languages),
      visibility: j.visibility,
      subject: j.subject,
      level: j.level,
      city: j.city,
      country: j.country,
      budgetMin: j.budgetMin,
      budgetMax: j.budgetMax,
      currency: j.currency,
      whenNeeded: j.whenNeeded,
      frequency: j.frequency,
      budgetType: j.budgetType,
      genderPref: j.genderPref,
      status: j.status,
      createdAt: j.createdAt.toISOString(),
      studentName: j.student.name,
      coinPrice: currentCoinPrice(j.createdAt, j.applyCount),
      applyCount: j.applyCount,
      earlyAccessUntil: new Date(j.createdAt.getTime() + EARLY_ACCESS_HOURS * 36e5).toISOString(),
    };
  }
}
