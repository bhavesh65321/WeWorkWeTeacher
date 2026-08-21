import { IsEmail, IsIn, IsOptional, IsString, Length, MinLength } from "class-validator";

export class SendOtpDto {
  @IsIn(["EMAIL", "PHONE"])
  channel: "EMAIL" | "PHONE";

  @IsIn(["VERIFY", "LOGIN", "RESET"])
  purpose: "VERIFY" | "LOGIN" | "RESET";

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;
}

export class VerifyOtpDto {
  @IsIn(["EMAIL", "PHONE"])
  channel: "EMAIL" | "PHONE";

  @IsIn(["VERIFY", "LOGIN", "RESET"])
  purpose: "VERIFY" | "LOGIN" | "RESET";

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

  @IsString()
  @Length(4, 8)
  code: string;
}

export class GoogleExchangeDto {
  @IsString()
  code: string;

  @IsString()
  redirectUri: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 8)
  code: string;

  @MinLength(8)
  password: string;
}
