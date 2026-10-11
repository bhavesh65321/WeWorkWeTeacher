import { Body, Controller, Get, Headers, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { IsIn, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { PaymentsService } from "./payments.service";

class CheckoutCoinsDto {
  @Type(() => Number)
  @IsIn([50, 200, 500])
  coins: number;
}

class ConfirmDto {
  @IsOptional()
  @IsString()
  session_id?: string;
}

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get("packs")
  packs() {
    return this.payments.packs();
  }

  @Post("checkout/coins")
  @UseGuards(JwtAuthGuard)
  checkoutCoins(@CurrentUser() user: AuthUser, @Body() dto: CheckoutCoinsDto) {
    return this.payments.checkoutCoins(user.sub, dto.coins);
  }

  @Get("confirm")
  @UseGuards(JwtAuthGuard)
  confirm(@CurrentUser() user: AuthUser, @Query() query: ConfirmDto) {
    if (!query.session_id) return { ok: false };
    return this.payments.confirmSession(user.sub, query.session_id);
  }

  @Post("stripe/webhook")
  webhook(@Req() req: RawBodyRequest<Request>, @Headers("stripe-signature") signature: string) {
    const raw = req.rawBody;
    if (!raw || !signature) return { received: false };
    return this.payments.handleWebhook(raw, signature);
  }
}
