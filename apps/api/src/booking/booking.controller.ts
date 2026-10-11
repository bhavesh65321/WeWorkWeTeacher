import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsInt, IsISO8601, IsOptional, IsString, Max, Min } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { BookingService } from "./booking.service";

class CreateBookingDto {
  @IsString()
  conversationId: string;

  @IsISO8601()
  startsAt: string;

  @IsInt()
  @Min(30)
  @Max(180)
  durationMin: number;
}

class ReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  body?: string;
}

class CancelDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookings: BookingService) {}

  @Get()
  mine(@CurrentUser() user: AuthUser) {
    return this.bookings.mine(user.sub);
  }

  @Get("reviews")
  reviews(@CurrentUser() user: AuthUser) {
    return this.bookings.listReviews(user.sub);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) {
    return this.bookings.create(user.sub, dto.conversationId, dto.startsAt, dto.durationMin);
  }

  @Post(":id/confirm")
  confirm(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.bookings.confirm(user.sub, id);
  }

  @Post(":id/complete")
  complete(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.bookings.complete(user.sub, id);
  }

  @Post(":id/cancel")
  cancel(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: CancelDto) {
    return this.bookings.cancel(user.sub, id, dto.reason);
  }

  @Post(":id/review")
  review(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: ReviewDto) {
    return this.bookings.review(user.sub, id, dto.rating, dto.body);
  }
}
