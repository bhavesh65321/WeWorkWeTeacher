import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { COIN_PACKS } from "../marketplace-rules";
import { track } from "../analytics";

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
  ) {
    const key = this.config.get<string>("STRIPE_SECRET_KEY");
    if (key) this.stripe = new Stripe(key);
  }

  live() {
    return Boolean(this.stripe);
  }

  packs() {
    return { live: this.live(), packs: COIN_PACKS };
  }

  async checkoutCoins(userId: string, coins: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.blockedAt) {
      throw new ForbiddenException("Your account has been blocked. Contact support.");
    }
    const pack = COIN_PACKS.find((p) => p.coins === coins);
    if (!pack) throw new BadRequestException("Unknown pack");

    if (!this.stripe) {
      await this.wallet.creditCoins(userId, pack.coins, "PURCHASE", `Sandbox pack ${pack.coins}`);
      await this.prisma.payment.create({
        data: {
          userId,
          kind: "COIN_PACK",
          status: "PAID",
          coins: pack.coins,
          amountMinor: pack.amountMinor,
          provider: "SANDBOX",
          paidAt: new Date(),
        },
      });
      track("coins_purchased", userId, user?.activeRole ?? "STUDENT", { coins: pack.coins, mode: "sandbox" });
      return { mode: "sandbox" as const, credited: true };
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        kind: "COIN_PACK",
        status: "PENDING",
        coins: pack.coins,
        amountMinor: pack.amountMinor,
        provider: "STRIPE",
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${this.web()}/wallet?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.web()}/wallet?canceled=1`,
      client_reference_id: payment.id,
      metadata: { paymentId: payment.id, kind: "COIN_PACK" },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: pack.amountMinor,
            product_data: { name: `${pack.coins} WTWS coins` },
          },
        },
      ],
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: session.id },
    });

    return { mode: "stripe" as const, url: session.url };
  }

  async confirmSession(userId: string, sessionId: string) {
    if (!this.stripe) throw new BadRequestException("Stripe is not configured");
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") throw new BadRequestException("Payment not complete");
    return this.fulfill(session.id, session.metadata ?? {}, userId);
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!this.stripe || !secret) throw new BadRequestException("Webhook not configured");
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    if (event.type !== "checkout.session.completed") return { received: true };
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      await this.fulfill(session.id, session.metadata ?? {});
    }
    return { received: true };
  }

  private async fulfill(sessionId: string, metadata: Record<string, string>, expectedUserId?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { OR: [{ providerRef: sessionId }, { id: metadata.paymentId }] },
    });
    if (!payment) throw new BadRequestException("Payment not found");
    if (expectedUserId && payment.userId !== expectedUserId) throw new BadRequestException("Payment mismatch");

    const claimed = await this.prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "PAID", providerRef: sessionId, paidAt: new Date() },
    });
    if (claimed.count === 0) return { ok: true, already: true };

    if (payment.kind === "COIN_PACK" && payment.coins) {
      await this.wallet.creditCoins(payment.userId, payment.coins, "PURCHASE", `Stripe pack ${payment.coins}`, payment.id);
      track("coins_purchased", payment.userId, "STUDENT", { coins: payment.coins, mode: "stripe" });
    }

    return { ok: true };
  }

  private web() {
    return this.config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000";
  }
}
