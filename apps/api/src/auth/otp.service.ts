import { randomInt } from "crypto";
import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { normalizePhone } from "../marketplace-rules";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 45 * 1000;
const OTP_MAX_ATTEMPTS = 8;

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  echoEnabled() {
    if (process.env.AUTH_OTP_ECHO === "true") return true;
    if (process.env.AUTH_OTP_ECHO === "false") return false;
    return process.env.NODE_ENV !== "production";
  }

  async send(input: { channel: "EMAIL" | "PHONE"; purpose: "VERIFY" | "LOGIN" | "RESET"; destination: string; userId?: string }) {
    const destination =
      input.channel === "EMAIL" ? input.destination.toLowerCase().trim() : normalizePhone(input.destination);
    const recent = await this.prisma.otpChallenge.findFirst({
      where: { destination, purpose: input.purpose, consumedAt: null, createdAt: { gte: new Date(Date.now() - OTP_COOLDOWN_MS) } },
      orderBy: { createdAt: "desc" },
    });
    if (recent) throw new HttpException("Wait a moment before requesting another code", HttpStatus.TOO_MANY_REQUESTS);

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = await bcrypt.hash(code, 10);
    await this.prisma.otpChallenge.create({
      data: {
        userId: input.userId,
        channel: input.channel,
        purpose: input.purpose,
        destination,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    const via =
      input.channel === "EMAIL" ? await this.deliverEmail(destination, code) : await this.deliverSms(destination, code);

    return {
      ok: true as const,
      via,
      destination: this.mask(input.channel, destination),
      expiresInSec: OTP_TTL_MS / 1000,
      ...(this.echoEnabled() ? { devCode: code } : {}),
    };
  }

  async consume(input: { channel: "EMAIL" | "PHONE"; purpose: "VERIFY" | "LOGIN" | "RESET"; destination: string; code: string }) {
    const destination =
      input.channel === "EMAIL" ? input.destination.toLowerCase().trim() : normalizePhone(input.destination);
    const row = await this.prisma.otpChallenge.findFirst({
      where: { destination, purpose: input.purpose, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!row) throw new BadRequestException("Code expired. Request a new one.");
    if (row.attempts >= OTP_MAX_ATTEMPTS) throw new BadRequestException("Too many attempts. Request a new code.");
    const ok = await bcrypt.compare(input.code.trim(), row.codeHash);
    await this.prisma.otpChallenge.update({
      where: { id: row.id },
      data: ok ? { attempts: { increment: 1 }, consumedAt: new Date() } : { attempts: { increment: 1 } },
    });
    if (!ok) throw new UnauthorizedException("Invalid code");
    return row;
  }

  private mask(channel: "EMAIL" | "PHONE", dest: string) {
    if (channel === "EMAIL") {
      const [u, d] = dest.split("@");
      return `${u.slice(0, 2)}***@${d}`;
    }
    return `***${dest.slice(-4)}`;
  }

  private async deliverEmail(to: string, code: string) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.info(`[otp] email ${to} code ${code}`);
      return "sandbox" as const;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "WTWS <noreply@wtws.dev>",
        to: [to],
        subject: "Your WTWS verification code",
        text: `Your WTWS code is ${code}. It expires in 10 minutes.`,
      }),
    });
    if (!res.ok) throw new BadRequestException("Could not send email code");
    return "email" as const;
  }

  private async deliverSms(to: string, code: string) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM;
    if (!sid || !token || !from) {
      console.info(`[otp] sms ${to} code ${code}`);
      return "sandbox" as const;
    }
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: `WTWS code: ${code}. Expires in 10 minutes.` }),
    });
    if (!res.ok) throw new BadRequestException("Could not send SMS code");
    return "sms" as const;
  }
}
