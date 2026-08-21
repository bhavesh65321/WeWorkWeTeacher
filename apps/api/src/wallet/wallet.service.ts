import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async ensure(userId: string) {
    const existing = await this.prisma.wallet.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.wallet.create({ data: { userId, coinBalance: 0, fiatMinor: 0 } });
  }

  async get(userId: string) {
    const wallet = await this.ensure(userId);
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return {
      coinBalance: wallet.coinBalance,
      fiatMinor: wallet.fiatMinor,
      referralCode: user?.referralCode ?? null,
      premiumUntil: user?.premiumUntil?.toISOString() ?? null,
      isPremium: Boolean(user?.premiumUntil && user.premiumUntil > new Date()),
      livePayments: Boolean(process.env.STRIPE_SECRET_KEY),
      entries,
    };
  }

  async creditCoins(userId: string, amount: number, type: string, note?: string, refId?: string) {
    const wallet = await this.ensure(userId);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { coinBalance: { increment: amount } },
      });
      await tx.ledgerEntry.create({
        data: { walletId: wallet.id, amount, unit: "COIN", type, note, refId },
      });
      return updated;
    });
  }

  async debitCoins(userId: string, amount: number, type: string, note?: string, refId?: string) {
    const wallet = await this.ensure(userId);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.updateMany({
        where: { id: wallet.id, coinBalance: { gte: amount } },
        data: { coinBalance: { decrement: amount } },
      });
      if (updated.count !== 1) throw new ConflictException("Not enough coins");
      await tx.ledgerEntry.create({
        data: { walletId: wallet.id, amount: -amount, unit: "COIN", type, note, refId },
      });
      return tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    });
  }

  async creditFiat(userId: string, amount: number, type: string, note?: string, refId?: string) {
    const wallet = await this.ensure(userId);
    return this.prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { fiatMinor: { increment: amount } },
      });
      await tx.ledgerEntry.create({
        data: { walletId: wallet.id, amount, unit: "FIAT", type, note, refId },
      });
    });
  }

  buySandbox(userId: string, coins: number) {
    const pack = coins === 500 ? 500 : coins === 200 ? 200 : 50;
    return this.creditCoins(userId, pack, "PURCHASE", `Sandbox pack ${pack}`);
  }
}
