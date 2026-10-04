import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TeachingMode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { asSkills, asStringArray, jsonList, jsonSkills } from "../json-list";
import { track } from "../analytics";

export type TutorQuery = {
  q?: string;
  mode?: string;
  subject?: string;
  city?: string;
  level?: string;
  minRating?: string;
  maxRate?: string;
};

@Injectable()
export class TutorsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: TutorQuery) {
    const now = new Date();
    const where: Prisma.TutorProfileWhereInput = { isPublished: true };
    if (query.city) {
      where.city = { contains: query.city };
    }

    const tutors = await this.prisma.tutorProfile.findMany({
      where,
      include: { user: true },
      take: 80,
    });

    const q = query.q?.trim().toLowerCase();
    return tutors
      .filter((t) => {
        const subjects = asStringArray(t.subjects);
        const modes = asStringArray(t.modes);
        const levels = asStringArray(t.levels);
        if (query.mode && query.mode !== "ALL" && !modes.includes(query.mode)) return false;
        if (query.subject && !subjects.some((s) => s.toLowerCase() === query.subject!.toLowerCase())) return false;
        if (query.level && !levels.includes(query.level)) return false;
        if (query.minRating && t.ratingAvg < Number(query.minRating)) return false;
        if (query.maxRate && (t.hourlyRateMinor ?? 0) > Math.round(Number(query.maxRate) * 100)) return false;
        if (q) {
          const hay = [t.user.name, t.headline ?? "", t.bio ?? "", ...subjects].join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ap = Boolean(a.user.premiumUntil && a.user.premiumUntil > now) ? 1 : 0;
        const bp = Boolean(b.user.premiumUntil && b.user.premiumUntil > now) ? 1 : 0;
        if (ap !== bp) return bp - ap;
        if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 40)
      .map((t) => this.toCard(t));
  }

  async mine(userId: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!tutor) throw new NotFoundException("Enable tutor role first");
    return this.toCard(tutor);
  }

  async bySlug(slug: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { slug },
      include: { user: true },
    });
    if (!tutor || !tutor.isPublished) throw new NotFoundException("Tutor not found");
    const reviews = await this.prisma.review.findMany({
      where: { toId: tutor.userId },
      include: { from: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return {
      ...this.toCard(tutor),
      isPremium: Boolean(tutor.user.premiumUntil && tutor.user.premiumUntil > new Date()),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        fromName: r.from.name.split(" ")[0],
      })),
    };
  }

  async subjects() {
    const tutors = await this.prisma.tutorProfile.findMany({
      where: { isPublished: true },
      select: { subjects: true, city: true, country: true },
    });
    const subjectSet = new Set<string>();
    const citySet = new Set<string>();
    for (const t of tutors) {
      asStringArray(t.subjects).forEach((s) => subjectSet.add(s));
      if (t.city) citySet.add(t.city);
    }
    return { subjects: [...subjectSet].sort(), cities: [...citySet].sort() };
  }

  async updateMine(
    userId: string,
    data: {
      headline?: string;
      bio?: string;
      hourlyRateMinor?: number;
      hourlyRateMaxMinor?: number;
      currency?: string;
      rateType?: string;
      city?: string;
      country?: string;
      photoUrl?: string;
      timezone?: string;
      skills?: { name: string; level: string }[];
      modes?: TeachingMode[];
      levels?: string[];
      languages?: string[];
      teachingApproach?: string;
      experience?: string;
      education?: string;
      freeTrialMinutes?: number;
      yearsTeaching?: number;
      yearsOnline?: number;
      gender?: string;
      worksAs?: string;
      isPublished?: boolean;
      notifyMatching?: boolean;
    },
  ) {
    const profile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("Enable tutor role first");
    const skills = data.skills ? cleanSkills(data.skills) : undefined;
    const modes = data.modes;
    const languages = data.languages?.map((s) => s.trim()).filter(Boolean);
    const fullSave = data.headline !== undefined || skills !== undefined;
    const rateType = data.rateType ?? profile.rateType ?? "HOURLY";
    const merged = {
      photoUrl: data.photoUrl ?? profile.photoUrl,
      headline: data.headline ?? profile.headline,
      bio: data.bio ?? profile.bio,
      hourlyRateMinor: data.hourlyRateMinor ?? profile.hourlyRateMinor,
      city: data.city ?? profile.city,
      country: data.country ?? profile.country,
      subjects: skills ? skills.map((s) => s.name) : asStringArray(profile.subjects),
      modes: modes ?? asStringArray(profile.modes),
      languages: languages ?? asStringArray(profile.languages),
      rateType,
    };
    if (fullSave || data.isPublished === true) {
      const missing = profileGaps(merged);
      if (missing.length) {
        throw new BadRequestException(`Complete your teaching profile: ${missing.join(", ")}`);
      }
    }
    const updated = await this.prisma.tutorProfile.update({
      where: { userId },
      data: {
        headline: data.headline,
        bio: data.bio,
        hourlyRateMinor: data.rateType === "FREE" ? 0 : data.hourlyRateMinor,
        hourlyRateMaxMinor: data.rateType === "FREE" ? null : data.hourlyRateMaxMinor,
        currency: data.currency,
        rateType: data.rateType,
        city: data.city,
        country: data.country,
        photoUrl: data.photoUrl,
        timezone: data.timezone,
        subjects: skills ? jsonSkills(skills) : undefined,
        modes: data.modes ? jsonList(data.modes) : undefined,
        levels: data.levels ? jsonList(data.levels) : undefined,
        languages: languages ? jsonList(languages) : undefined,
        teachingApproach: data.teachingApproach,
        experience: data.experience,
        education: data.education,
        freeTrialMinutes: data.freeTrialMinutes,
        yearsTeaching: data.yearsTeaching,
        yearsOnline: data.yearsOnline,
        gender: data.gender,
        worksAs: data.worksAs,
        isPublished: data.isPublished,
        notifyMatching: data.notifyMatching,
      },
      include: { user: true },
    });

    // Auto-unpublish if required fields removed
    if (updated.isPublished) {
      const gaps = profileGaps({
        photoUrl: updated.photoUrl,
        headline: updated.headline,
        bio: updated.bio,
        hourlyRateMinor: updated.hourlyRateMinor,
        city: updated.city,
        country: updated.country,
        subjects: asSkills(updated.subjects).map((s) => s.name),
        modes: asStringArray(updated.modes),
        languages: asStringArray(updated.languages),
        rateType: updated.rateType,
      });

      if (gaps.length > 0) {
        await this.prisma.tutorProfile.update({
          where: { userId },
          data: { isPublished: false },
        });
        updated.isPublished = false;
      }
    }

    if (data.isPublished === true && !profile.isPublished) {
      track("tutor_published", userId, "TUTOR");
    }
    return this.toCard(updated);
  }

  async savePhoto(userId: string, file: { originalname: string; buffer: Buffer; mimetype: string; size: number }) {
    const profile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("Enable tutor role first");
    const ext = file.originalname.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/)?.[0];
    if (!ext || !file.mimetype.startsWith("image/") || file.size > 2_000_000) {
      throw new BadRequestException("Upload a JPG, PNG, or WebP image under 2 MB");
    }
    const { mkdir, writeFile } = await import("fs/promises");
    const { join } = await import("path");
    const { randomUUID } = await import("crypto");
    const dir = join(process.cwd(), "uploads", "tutors");
    await mkdir(dir, { recursive: true });
    const filename = `${userId}-${randomUUID()}${ext}`;
    await writeFile(join(dir, filename), file.buffer);
    const updated = await this.prisma.tutorProfile.update({
      where: { userId },
      data: { photoUrl: `/api/uploads/tutors/${filename}` },
      include: { user: true },
    });
    return this.toCard(updated);
  }

  private toCard(t: {
    id: string;
    userId: string;
    slug: string;
    headline: string | null;
    bio: string | null;
    hourlyRateMinor: number | null;
    hourlyRateMaxMinor?: number | null;
    currency: string;
    timezone: string;
    city: string | null;
    country: string | null;
    subjects: Prisma.JsonValue;
    modes: Prisma.JsonValue;
    levels: Prisma.JsonValue;
    languages: Prisma.JsonValue;
    teachingApproach?: string | null;
    experience?: string | null;
    education?: string | null;
    freeTrialMinutes?: number;
    yearsTeaching?: number | null;
    yearsOnline?: number | null;
    gender?: string | null;
    worksAs?: string;
    isPublished?: boolean;
    notifyMatching?: boolean;
    ratingAvg: number;
    reviewCount: number;
    photoUrl?: string | null;
    rateType?: string;
    user: { name: string; createdAt: Date; lastSeenAt?: Date | null; emailVerifiedAt?: Date | null; phoneVerifiedAt?: Date | null };
  }) {
    const skills = asSkills(t.subjects);
    return {
      id: t.id,
      userId: t.userId,
      slug: t.slug,
      name: t.user.name,
      headline: t.headline,
      bio: t.bio,
      hourlyRateMinor: t.hourlyRateMinor,
      hourlyRateMaxMinor: t.hourlyRateMaxMinor ?? null,
      currency: t.currency,
      rateType: t.rateType ?? "HOURLY",
      photoUrl: t.photoUrl ?? null,
      timezone: t.timezone,
      city: t.city,
      country: t.country,
      subjects: skills.map((s) => s.name),
      skills,
      modes: asStringArray(t.modes) as TeachingMode[],
      levels: asStringArray(t.levels),
      languages: asStringArray(t.languages),
      teachingApproach: t.teachingApproach ?? null,
      experience: t.experience ?? null,
      education: t.education ?? null,
      freeTrialMinutes: t.freeTrialMinutes ?? 0,
      yearsTeaching: t.yearsTeaching ?? null,
      yearsOnline: t.yearsOnline ?? null,
      gender: t.gender ?? null,
      worksAs: t.worksAs ?? "INDIVIDUAL",
      isPublished: t.isPublished ?? true,
      notifyMatching: t.notifyMatching ?? true,
      registeredAt: t.user.createdAt.toISOString(),
      lastSeenAt: t.user.lastSeenAt ? t.user.lastSeenAt.toISOString() : null,
      ratingAvg: t.ratingAvg,
      reviewCount: t.reviewCount,
      emailVerified: !!t.user.emailVerifiedAt,
      phoneVerified: !!t.user.phoneVerifiedAt,
    };
  }
}

function cleanSkills(raw: { name: string; level: string }[]) {
  const out: { name: string; level: string }[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const name = item.name.trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 60) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const level = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(item.level)
      ? item.level
      : "INTERMEDIATE";
    out.push({ name, level });
  }
  if (out.length > 30) throw new BadRequestException("Add at most 30 subjects or skills");
  return out;
}

function profileGaps(p: {
  photoUrl?: string | null;
  headline: string | null;
  bio: string | null;
  hourlyRateMinor: number | null;
  city: string | null;
  country: string | null;
  subjects: string[];
  modes: string[];
  languages: string[];
  rateType: string;
}) {
  const missing: string[] = [];
  if (!p.photoUrl) missing.push("profile photo");
  if (!p.headline?.trim() || p.headline.trim().length < 8) missing.push("headline");
  if (!p.bio?.trim() || p.bio.trim().length < 20) missing.push("bio");
  if (p.rateType !== "FREE" && p.hourlyRateMinor == null) missing.push("rate");
  if (!p.subjects.length) missing.push("at least one subject or skill");
  if (!p.modes.length) missing.push("how you teach");
  if (!p.languages.length) missing.push("languages");
  if (!p.city?.trim()) missing.push("city");
  if (!p.country?.trim()) missing.push("country");
  return missing;
}
