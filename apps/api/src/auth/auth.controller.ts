import { Body, Controller, Get, HttpCode, Patch, Post, Query, Res, UseGuards, Delete } from "@nestjs/common";
import type { Response } from "express";
import { Role } from "@prisma/client";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { SwitchRoleDto } from "./dto/switch-role.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { GoogleExchangeDto, SendOtpDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto } from "./dto/otp.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtGuard } from "./optional-jwt.guard";
import { CurrentUser, type AuthUser } from "./current-user.decorator";

const COOKIE = "wtws_token";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);
    this.setCookie(res, result.token);
    return result;
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    this.setCookie(res, result.token);
    return result;
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.sub);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user.sub, dto);
  }

  @Get("export")
  @UseGuards(JwtAuthGuard)
  exportMe(@CurrentUser() user: AuthUser) {
    return this.auth.exportMe(user.sub);
  }

  @Delete("me")
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.deleteMe(user.sub);
    res.clearCookie(COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
    return result;
  }

  @Post("enable-tutor")
  @UseGuards(JwtAuthGuard)
  enableTutor(@CurrentUser() user: AuthUser) {
    return this.auth.enableTutor(user.sub);
  }

  @Post("role")
  @UseGuards(JwtAuthGuard)
  switchRole(@CurrentUser() user: AuthUser, @Body() dto: SwitchRoleDto) {
    return this.auth.switchRole(user.sub, dto.role as Role);
  }

  @Get("methods")
  methods() {
    return this.auth.methods();
  }

  @Get("google/url")
  googleUrl(@Query("redirectUri") redirectUri: string) {
    return this.auth.googleAuthUrl(redirectUri);
  }

  @Post("google/exchange")
  @HttpCode(200)
  async googleExchange(@Body() dto: GoogleExchangeDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.googleExchange(dto.code, dto.redirectUri);
    this.setCookie(res, result.token);
    return result;
  }

  @Post("forgot-password")
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post("reset-password")
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.email, dto.code, dto.password);
  }

  @Post("otp/send")
  @HttpCode(200)
  @UseGuards(OptionalJwtGuard)
  sendOtp(@Body() dto: SendOtpDto, @CurrentUser() user?: AuthUser) {
    return this.auth.sendOtp(dto, user?.sub);
  }

  @Post("otp/verify")
  @HttpCode(200)
  @UseGuards(OptionalJwtGuard)
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response, @CurrentUser() user?: AuthUser) {
    const result = await this.auth.verifyOtp(dto, user?.sub);
    if ("token" in result && result.token) this.setCookie(res, result.token);
    return result;
  }

  private setCookie(res: Response, token: string) {
    res.cookie(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });
  }
}
