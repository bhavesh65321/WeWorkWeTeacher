import { ArrayMinSize, IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";
import { JobType, JobVisibility, TeachingMode } from "@prisma/client";

export class CreateJobDto {
  @MinLength(8)
  title: string;

  @MinLength(20)
  description: string;

  @IsEnum(JobType)
  type: JobType;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(TeachingMode, { each: true })
  modes: TeachingMode[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages: string[];

  @IsEnum(JobVisibility)
  visibility: JobVisibility;

  @MinLength(2)
  subject: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  whenNeeded?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsIn(["HOURLY", "MONTHLY", "FIXED", "COURSE", "FREE"])
  budgetType: string;

  @IsOptional()
  @IsString()
  genderPref?: string;

  @IsIn(["USD", "INR", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"])
  currency: string;
}
