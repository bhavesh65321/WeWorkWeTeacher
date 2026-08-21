import { IsEmail, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @MinLength(2)
  name: string;

  @IsISO8601()
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;
}
