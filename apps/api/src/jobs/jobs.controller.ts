import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobStatusDto } from "./dto/update-job-status.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OptionalJwtGuard } from "../auth/optional-jwt.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";

@Controller("jobs")
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  list(
    @Query("mode") mode?: string,
    @Query("subject") subject?: string,
    @Query("type") type?: string,
    @Query("city") city?: string,
    @Query("q") q?: string,
    @Query("matched") matched?: string,
    @Query("level") level?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.jobs.list({ mode, subject, type, city, q, matched, level }, user?.sub);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.jobs.mine(user.sub);
  }

  @Get(":id/applicants")
  @UseGuards(JwtAuthGuard)
  applicants(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.jobs.applicants(user.sub, id);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard)
  setStatus(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateJobStatusDto) {
    return this.jobs.setStatus(user.sub, id, dto.status);
  }

  @Get(":id")
  @UseGuards(OptionalJwtGuard)
  get(@Param("id") id: string, @CurrentUser() user?: AuthUser) {
    return this.jobs.get(id, user?.sub);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: CreateJobDto) {
    return this.jobs.update(user.sub, id, dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateJobDto) {
    return this.jobs.create(user.sub, dto);
  }
}
