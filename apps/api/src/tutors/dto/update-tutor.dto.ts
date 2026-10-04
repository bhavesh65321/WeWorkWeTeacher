import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { TeachingMode } from "@prisma/client";

export class TutorSkillDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
  level: string;
}

export class UpdateTutorDto {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRateMinor?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRateMaxMinor?: number;

  @IsOptional()
  @IsIn(["USD", "INR", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"])
  currency?: string;

  @IsOptional()
  @IsIn(["HOURLY", "MONTHLY", "COURSE", "FREE"])
  rateType?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => TutorSkillDto)
  skills?: TutorSkillDto[];

  @IsOptional()
  @IsArray()
  modes?: TeachingMode[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  levels?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  teachingApproach?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  freeTrialMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsTeaching?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOnline?: number;

  @IsOptional()
  @IsIn(["FEMALE", "MALE", "OTHER", "UNDISCLOSED"])
  gender?: string;

  @IsOptional()
  @IsIn(["INDIVIDUAL", "AGENCY"])
  worksAs?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyMatching?: boolean;
}
