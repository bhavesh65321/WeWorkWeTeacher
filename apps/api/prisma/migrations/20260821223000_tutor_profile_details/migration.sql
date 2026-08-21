-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastSeenAt" DATETIME;

-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN "teachingApproach" TEXT;
ALTER TABLE "TutorProfile" ADD COLUMN "experience" TEXT;
ALTER TABLE "TutorProfile" ADD COLUMN "education" TEXT;
ALTER TABLE "TutorProfile" ADD COLUMN "hourlyRateMaxMinor" INTEGER;
ALTER TABLE "TutorProfile" ADD COLUMN "freeTrialMinutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TutorProfile" ADD COLUMN "yearsTeaching" INTEGER;
ALTER TABLE "TutorProfile" ADD COLUMN "yearsOnline" INTEGER;
ALTER TABLE "TutorProfile" ADD COLUMN "gender" TEXT;
ALTER TABLE "TutorProfile" ADD COLUMN "worksAs" TEXT NOT NULL DEFAULT 'INDIVIDUAL';
