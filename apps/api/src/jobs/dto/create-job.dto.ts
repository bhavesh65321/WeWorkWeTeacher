import { ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";
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

  @IsEnum(JobVisibility)
  visibility: JobVisibility;

  @MinLength(2)
  subject: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  city?: string;

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

  @IsOptional()
  @IsString()
  budgetType?: string;

  @IsOptional()
  @IsString()
  genderPref?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
