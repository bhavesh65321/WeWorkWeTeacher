-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN "photoUrl" TEXT;
ALTER TABLE "TutorProfile" ADD COLUMN "rateType" TEXT NOT NULL DEFAULT 'HOURLY';
