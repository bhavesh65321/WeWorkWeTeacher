import { LoginThrottle } from "./login-throttle";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { asStringArray, jsonList } from "../json-list";
import { REFERRAL_BONUS, STUDENT_STARTER_COINS, TUTOR_STARTER_COINS, normalizePhone } from "../marketplace-rules";
import { OtpService } from "./otp.service";
import { track } from "../analytics";

const MIN_AGE = 13;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly otp: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    this.assertAge(dto.dateOfBirth);
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(dto.password, 10);
    let phone: string | undefined;
    if (dto.phone) {
      try {
        phone = normalizePhone(dto.phone);
      } catch {
        throw new BadRequestException("Enter a valid phone with country code");
      }
    }
    const referrer = dto.referralCode
      ? await this.prisma.user.findUnique({ where: { referralCode: dto.referralCode } })
      : null;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name.trim(),
        dateOfBirth: new Date(dto.dateOfBirth),
        phone,
        roles: jsonList([Role.STUDENT]),
        activeRole: Role.STUDENT,
        referralCode: `wtws-${crypto.randomUUID().slice(0, 8)}`,
        referredById: referrer?.id,
        studentProfile: { create: {} },
        wallet: {
          create: {
            coinBalance: STUDENT_STARTER_COINS,
            entries: {
              create: {
                amount: STUDENT_STARTER_COINS,
                unit: "COIN",
                type: "STARTER",
                note: "Welcome coins",
              },
            },
          },
        },
      },
    });
    if (referrer) {
      const wallet = await this.prisma.wallet.findUnique({ where: { userId: referrer.id } });
      if (wallet) {
        await this.prisma.wallet.update({
          where: { id: wallet.id },
          data: { coinBalance: { increment: REFERRAL_BONUS } },
        });
        await this.prisma.ledgerEntry.create({
          data: {
            walletId: wallet.id,
            amount: REFERRAL_BONUS,
            unit: "COIN",
            type: "REFERRAL",
            note: `Referred ${user.email}`,
            refId: user.id,
          },
        });
      }
    }
    const issued = this.issue(user.id, user.email, user.activeRole, user.name, asStringArray(user.roles));
    track("signup_completed", user.id, user.activeRole);
    const otp = await this.otp.send({
      channel: "EMAIL",
      purpose: "VERIFY",
      destination: user.email,
      userId: user.id,
    });
    return { ...issued, needsVerify: true, otp };
  }

  private readonly loginThrottle = new LoginThrottle();

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    this.loginThrottle.assertAllowed(email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.loginThrottle.recordFailure(email);
      throw new UnauthorizedException("Invalid email or password");
    }
    if (user.deletedAt) throw new UnauthorizedException("Account closed");
    if (user.blockedAt) throw new ForbiddenException("Your account has been blocked. Contact support.");
    if (!user.passwordHash) {
      throw new UnauthorizedException("This account uses Google. Continue with Google, or reset your password.");
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      this.loginThrottle.recordFailure(email);
      throw new UnauthorizedException("Invalid email or password");
    }
    this.loginThrottle.clear(email);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
    return this.issue(user.id, user.email, user.activeRole, user.name, asStringArray(user.roles));
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true, studentProfile: true, wallet: true },
    });
    if (!user || user.deletedAt) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: asStringArray(user.roles),
      activeRole: user.activeRole,
      tutorSlug: user.tutorProfile?.slug ?? null,
      coinBalance: user.wallet?.coinBalance ?? 0,
      isPremium: Boolean(user.premiumUntil && user.premiumUntil > new Date()),
      isAdmin: asStringArray(user.roles).includes("ADMIN"),
      referralCode: user.referralCode,
      phone: user.phone,
      city: user.studentProfile?.city ?? user.tutorProfile?.city ?? null,
      country: user.studentProfile?.country ?? user.tutorProfile?.country ?? null,
      onboardingComplete: Boolean(user.phone && (user.studentProfile?.city || user.tutorProfile?.city)),
      tutorOnboardingComplete: Boolean(
        user.tutorProfile?.headline &&
          user.tutorProfile.hourlyRateMinor != null &&
          asStringArray(user.tutorProfile.subjects).length &&
          user.tutorProfile.city &&
          user.tutorProfile.country,
      ),
      unreadCount: await this.prisma.notification.count({ where: { userId, readAt: null } }),
      defaultVisibility: user.studentProfile?.defaultVisibility ?? "PUBLIC",
      tutorPublished: user.tutorProfile?.isPublished ?? null,
      notifyMatching: user.tutorProfile?.notifyMatching ?? null,
      emailVerified: Boolean(user.emailVerifiedAt),
      phoneVerified: Boolean(user.phoneVerifiedAt),
      hasGoogle: Boolean(user.googleId),
      hasPassword: Boolean(user.passwordHash),
    };
  }

  async updateProfile(userId: string, dto: { phone?: string; city?: string; country?: string; name?: string; defaultVisibility?: string }) {
    const data: { phone?: string; name?: string; phoneVerifiedAt?: Date | null } = {};
    if (dto.name?.trim()) data.name = dto.name.trim();
    if (dto.phone) {
      try {
        const phone = normalizePhone(dto.phone);
        data.phone = phone;
        const current = await this.prisma.user.findUnique({ where: { id: userId } });
        if (current?.phone !== phone) data.phoneVerifiedAt = null;
      } catch {
        throw new BadRequestException("Enter a valid phone with country code");
      }
    }
    if (Object.keys(data).length) {
      await this.prisma.user.update({ where: { id: userId }, data });
    }
    if (dto.city !== undefined || dto.country !== undefined || dto.defaultVisibility !== undefined) {
      await this.prisma.studentProfile.upsert({
        where: { userId },
        update: { city: dto.city, country: dto.country, defaultVisibility: dto.defaultVisibility },
        create: { userId, city: dto.city, country: dto.country, defaultVisibility: dto.defaultVisibility ?? "PUBLIC" },
      });
    }
    return this.me(userId);
  }

  async exportMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        tutorProfile: true,
        wallet: { include: { entries: true } },
        jobsPosted: true,
        studentBookings: true,
        reviewsGiven: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        roles: asStringArray(user.roles),
      },
      studentProfile: user.studentProfile,
      tutorProfile: user.tutorProfile
        ? { ...user.tutorProfile, subjects: asStringArray(user.tutorProfile.subjects) }
        : null,
      wallet: user.wallet,
      jobs: user.jobsPosted,
      bookings: user.studentBookings,
      reviews: user.reviewsGiven,
    };
  }

  async deleteMe(userId: string) {
    const stamp = Date.now();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted-${stamp}@deleted.wtws`,
        name: "Deleted user",
        phone: null,
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
      },
    });
    return { ok: true };
  }

  async enableTutor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true },
    });
    if (!user) throw new UnauthorizedException();

    const roles = asStringArray(user.roles);
    const nextRoles = roles.includes(Role.TUTOR) ? roles : [...roles, Role.TUTOR];
    const slug = user.tutorProfile?.slug ?? (await this.uniqueSlug(user.name));
    const createdTutor = !user.tutorProfile;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: jsonList(nextRoles),
        activeRole: Role.TUTOR,
        tutorProfile: user.tutorProfile
          ? undefined
          : {
              create: {
                slug,
                headline: "New tutor",
                subjects: jsonList([]),
                modes: jsonList(["ONLINE"]),
                levels: jsonList([]),
                languages: jsonList(["English"]),
              },
            },
      },
    });
    if (createdTutor) {
      const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
      if (wallet) {
        await this.prisma.wallet.update({
          where: { id: wallet.id },
          data: { coinBalance: { increment: TUTOR_STARTER_COINS } },
        });
        await this.prisma.ledgerEntry.create({
          data: {
            walletId: wallet.id,
            amount: TUTOR_STARTER_COINS,
            unit: "COIN",
            type: "STARTER",
            note: "Tutor starter coins",
          },
        });
      } else {
        await this.prisma.wallet.create({
          data: {
            userId,
            coinBalance: TUTOR_STARTER_COINS,
            entries: {
              create: { amount: TUTOR_STARTER_COINS, unit: "COIN", type: "STARTER", note: "Tutor starter coins" },
            },
          },
        });
      }
    }
    return this.me(userId);
  }

  async switchRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (!asStringArray(user.roles).includes(role)) {
      throw new BadRequestException("Enable this role first");
    }
    await this.prisma.user.update({ where: { id: userId }, data: { activeRole: role } });
    return this.me(userId);
  }

  private issue(id: string, email: string, activeRole: Role, name: string, roles: string[]) {
    const token = this.jwt.sign({ sub: id, email, activeRole });
    return { token, user: { id, email, name, roles, activeRole } };
  }

  private assertAge(dateOfBirth: string) {
    const dob = new Date(dateOfBirth);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
    if (Number.isNaN(dob.getTime()) || dob > cutoff) {
      throw new BadRequestException("You must be 13 or older to use gurumates");
    }
  }

  private async uniqueSlug(name: string) {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "tutor";
    let slug = base;
    let n = 1;
    while (await this.prisma.tutorProfile.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }

  methods() {
    return {
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      otpEcho: this.otp.echoEnabled(),
    };
  }

  googleAuthUrl(redirectUri: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new BadRequestException("Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
    }
    this.assertRedirect(redirectUri);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    });
    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` };
  }

  async googleExchange(code: string, redirectUri: string) {
    this.assertRedirect(redirectUri);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new BadRequestException("Google sign-in is not configured");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenRes.ok || !tokens.access_token) {
      throw new UnauthorizedException("Google sign-in failed");
    }
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = (await profileRes.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
    };
    if (!profile.email || !profile.sub) throw new UnauthorizedException("Google did not return an email");
    if (profile.email_verified === false) throw new UnauthorizedException("Google email is not verified");

    const email = profile.email.toLowerCase();
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.sub }, { email }], deletedAt: null },
    });
    if (user?.deletedAt) throw new UnauthorizedException("Account closed");
    if (user?.blockedAt) throw new ForbiddenException("Your account has been blocked. Contact support.");
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId: profile.sub,
          name: (profile.name || email.split("@")[0]).trim(),
          emailVerifiedAt: new Date(),
          passwordHash: null,
          roles: jsonList([Role.STUDENT]),
          activeRole: Role.STUDENT,
          referralCode: `wtws-${crypto.randomUUID().slice(0, 8)}`,
          studentProfile: { create: {} },
          wallet: {
            create: {
              coinBalance: STUDENT_STARTER_COINS,
              entries: { create: { amount: STUDENT_STARTER_COINS, unit: "COIN", type: "STARTER", note: "Welcome coins" } },
            },
          },
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.sub, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
      });
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
    const issued = this.issue(user.id, user.email, user.activeRole, user.name, asStringArray(user.roles));
    track("signup_completed", user.id, user.activeRole);
    return {
      ...issued,
      needsVerify: false,
      isNew: !user.phone,
    };
  }

  async sendOtp(
    dto: { channel: "EMAIL" | "PHONE"; purpose: "VERIFY" | "LOGIN" | "RESET"; email?: string; phone?: string },
    userId?: string,
  ) {
    if (dto.purpose === "VERIFY") {
      if (!userId) throw new UnauthorizedException();
      const me = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!me) throw new UnauthorizedException();
      if (dto.channel === "EMAIL") {
        return this.otp.send({ channel: "EMAIL", purpose: "VERIFY", destination: me.email, userId });
      }
      const phone = dto.phone ? normalizePhone(dto.phone) : me.phone;
      if (!phone) throw new BadRequestException("Add a phone number first");
      if (dto.phone && phone !== me.phone) {
        await this.prisma.user.update({ where: { id: userId }, data: { phone, phoneVerifiedAt: null } });
      }
      return this.otp.send({ channel: "PHONE", purpose: "VERIFY", destination: phone, userId });
    }

    if (dto.purpose === "RESET") {
      if (!dto.email) throw new BadRequestException("Email is required");
      return this.forgotPassword(dto.email);
    }

    if (dto.channel === "EMAIL") {
      if (!dto.email) throw new BadRequestException("Email is required");
      const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (!user || user.deletedAt) throw new BadRequestException("No account for that email");
      return this.otp.send({ channel: "EMAIL", purpose: "LOGIN", destination: user.email, userId: user.id });
    }
    if (!dto.phone) throw new BadRequestException("Phone is required");
    const phone = normalizePhone(dto.phone);
    const user = await this.prisma.user.findFirst({ where: { phone, deletedAt: null } });
    if (!user?.phoneVerifiedAt) throw new BadRequestException("No verified mobile for that number");
    return this.otp.send({ channel: "PHONE", purpose: "LOGIN", destination: phone, userId: user.id });
  }

  async verifyOtp(
    dto: { channel: "EMAIL" | "PHONE"; purpose: "VERIFY" | "LOGIN" | "RESET"; email?: string; phone?: string; code: string },
    userId?: string,
  ) {
    if (dto.purpose === "VERIFY") {
      if (!userId) throw new UnauthorizedException();
      const me = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!me) throw new UnauthorizedException();
      const destination = dto.channel === "EMAIL" ? me.email : dto.phone || me.phone;
      if (!destination) throw new BadRequestException("Missing destination");
      await this.otp.consume({ channel: dto.channel, purpose: "VERIFY", destination, code: dto.code });
      if (dto.channel === "EMAIL") {
        await this.prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
      } else {
        const phone = normalizePhone(destination);
        await this.prisma.user.update({
          where: { id: userId },
          data: { phone, phoneVerifiedAt: new Date() },
        });
      }
      track("otp_verified", userId, me.activeRole, { type: dto.channel });
      return this.me(userId);
    }

    if (dto.purpose === "RESET") {
      throw new BadRequestException("Use reset password");
    }

    const destination = dto.channel === "EMAIL" ? dto.email : dto.phone;
    if (!destination) throw new BadRequestException("Email or phone is required");
    await this.otp.consume({ channel: dto.channel, purpose: "LOGIN", destination, code: dto.code });
    const user =
      dto.channel === "EMAIL"
        ? await this.prisma.user.findUnique({ where: { email: destination.toLowerCase() } })
        : await this.prisma.user.findFirst({ where: { phone: normalizePhone(destination), deletedAt: null } });
    if (!user || user.deletedAt) throw new UnauthorizedException("Invalid code");
    if (dto.channel === "EMAIL" && !user.emailVerifiedAt) {
      await this.prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
    return {
      ...this.issue(user.id, user.email, user.activeRole, user.name, asStringArray(user.roles)),
      needsVerify: !user.emailVerifiedAt,
    };
  }

  async forgotPassword(email: string) {
    const dest = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: dest } });
    if (user && !user.deletedAt) {
      try {
        return await this.otp.send({ channel: "EMAIL", purpose: "RESET", destination: user.email, userId: user.id });
      } catch (err) {
        if (!(err instanceof HttpException && err.getStatus() === HttpStatus.TOO_MANY_REQUESTS)) throw err;
      }
    }
    const [u, d] = dest.split("@");
    return { ok: true as const, via: "email" as const, destination: `${u.slice(0, 2)}***@${d}` };
  }

  async resetPassword(email: string, code: string, password: string) {
    const dest = email.toLowerCase().trim();
    await this.otp.consume({ channel: "EMAIL", purpose: "RESET", destination: dest, code });
    const user = await this.prisma.user.findUnique({ where: { email: dest } });
    if (!user || user.deletedAt) throw new BadRequestException("Invalid or expired code");
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
    });
    return { ok: true };
  }

  private assertRedirect(redirectUri: string) {
    const origin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
    const allowed = `${origin}/auth/google/callback`;
    if (redirectUri !== allowed) throw new BadRequestException("Invalid Google redirect");
  }
}
