import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { TutorsService } from "./tutors.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator";
import { UpdateTutorDto } from "./dto/update-tutor.dto";

@Controller("tutors")
export class TutorsController {
  constructor(private readonly tutors: TutorsService) {}

  @Get()
  search(
    @Query("q") q?: string,
    @Query("mode") mode?: string,
    @Query("subject") subject?: string,
    @Query("city") city?: string,
    @Query("level") level?: string,
    @Query("minRating") minRating?: string,
    @Query("maxRate") maxRate?: string,
  ) {
    return this.tutors.search({ q, mode, subject, city, level, minRating, maxRate });
  }

  @Get("meta")
  meta() {
    return this.tutors.subjects();
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.tutors.mine(user.sub);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateTutorDto) {
    return this.tutors.updateMine(user.sub, dto);
  }

  @Post("me/photo")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 2_000_000 } }))
  uploadPhoto(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("Choose a photo");
    return this.tutors.savePhoto(user.sub, file);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.tutors.bySlug(slug);
  }
}
