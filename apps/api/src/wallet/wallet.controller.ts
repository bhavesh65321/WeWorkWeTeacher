import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsIn } from "class-validator";
import { Type } from "class-transformer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { WalletService } from "./wallet.service";
import { PrismaService } from "../prisma/prisma.service";
import { PREMIUM_COST, PREMIUM_DAYS } from "../marketplace-rules";

class BuyDto {
  @Type(() => Number)
  @IsIn([50, 200, 500])
  coins: number;
}

@Controller("wallet")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly wallet: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.wallet.get(user.sub);
  }

  @Post("buy")
  buy(@CurrentUser() user: AuthUser, @Body() dto: BuyDto) {
    return this.wallet.buySandbox(user.sub, dto.coins);
  }

  @Post("premium")
  async premium(@CurrentUser() user: AuthUser) {
    await this.wallet.debitCoins(user.sub, PREMIUM_COST, "PREMIUM", "Early job access");
    const until = new Date();
    until.setDate(until.getDate() + PREMIUM_DAYS);
    await this.prisma.user.update({ where: { id: user.sub }, data: { premiumUntil: until } });
    return this.wallet.get(user.sub);
  }
}
