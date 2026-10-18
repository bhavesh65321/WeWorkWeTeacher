import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const MATCH_RATE_LIMIT_PER_HOUR = 20;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly recentSends = new Map<string, number[]>();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get apiKey() {
    return this.config.get<string>("RESEND_API_KEY");
  }

  private get fromAddress() {
    return this.config.get<string>("EMAIL_FROM") ?? "WTWS <noreply@wtws.dev>";
  }

  private get webOrigin() {
    return this.config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000";
  }

  async send({ to, subject, html, text }: SendEmailArgs): Promise<"sent" | "sandbox" | "error"> {
    const key = this.apiKey;
    if (!key) {
      this.logger.log(`[email:sandbox] to=${to} subject=${subject}`);
      return "sandbox";
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: this.fromAddress, to: [to], subject, html, text }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        this.logger.error(`Resend failure ${res.status}: ${body}`);
        return "error";
      }
      return "sent";
    } catch (err) {
      this.logger.error(`Resend network error: ${err instanceof Error ? err.message : err}`);
      return "error";
    }
  }

  private checkRateLimit(tutorId: string): boolean {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const history = (this.recentSends.get(tutorId) ?? []).filter((t) => t > hourAgo);
    if (history.length >= MATCH_RATE_LIMIT_PER_HOUR) {
      this.recentSends.set(tutorId, history);
      return false;
    }
    history.push(now);
    this.recentSends.set(tutorId, history);
    return true;
  }

  async sendMatchNotification(
    tutorId: string,
    tutorEmail: string,
    job: { id: string; title: string; subject: string; city: string | null; modes: string[] },
  ) {
    if (!this.checkRateLimit(tutorId)) {
      this.logger.warn(`[email] match rate-limited for tutor=${tutorId}`);
      return "rate_limited" as const;
    }

    const jobUrl = `${this.webOrigin}/jobs/${job.id}`;
    const modesText = job.modes.join(", ") || "Any mode";
    const location = job.city ? ` · ${job.city}` : "";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
        <h2 style="margin: 0 0 8px; font-size: 20px;">New job matching your skills</h2>
        <p style="margin: 0 0 16px; color: #475569;">We found a job that fits your profile.</p>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f8fafc;">
          <h3 style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">${escapeHtml(job.title)}</h3>
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            ${escapeHtml(job.subject)} · ${escapeHtml(modesText)}${escapeHtml(location)}
          </p>
        </div>
        <a href="${jobUrl}" style="display: inline-block; margin-top: 20px; background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View job and apply
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
          Manage match alerts in your tutor profile settings.
        </p>
      </div>
    `.trim();

    const text = [
      `New job matching your skills: ${job.title}`,
      `${job.subject} · ${modesText}${location}`,
      ``,
      `View and apply: ${jobUrl}`,
    ].join("\n");

    return this.send({
      to: tutorEmail,
      subject: `New tutoring job matching your skills: ${job.title}`,
      html,
      text,
    });
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
