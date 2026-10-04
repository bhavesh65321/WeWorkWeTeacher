-- AlterTable
ALTER TABLE "Flag" ADD COLUMN "notes" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "modes" JSONB NOT NULL,
    "languages" JSONB NOT NULL DEFAULT [],
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "subject" TEXT NOT NULL,
    "level" TEXT,
    "city" TEXT,
    "country" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "whenNeeded" TEXT NOT NULL DEFAULT 'FLEXIBLE',
    "frequency" TEXT NOT NULL DEFAULT 'WEEKLY',
    "budgetType" TEXT NOT NULL DEFAULT 'HOURLY',
    "genderPref" TEXT NOT NULL DEFAULT 'ANY',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "applyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("applyCount", "budgetMax", "budgetMin", "budgetType", "city", "country", "createdAt", "currency", "description", "frequency", "genderPref", "id", "level", "modes", "status", "studentId", "subject", "title", "type", "updatedAt", "visibility", "whenNeeded") SELECT "applyCount", "budgetMax", "budgetMin", "budgetType", "city", "country", "createdAt", "currency", "description", "frequency", "genderPref", "id", "level", "modes", "status", "studentId", "subject", "title", "type", "updatedAt", "visibility", "whenNeeded" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_status_visibility_createdAt_idx" ON "Job"("status", "visibility", "createdAt");
CREATE INDEX "Job_subject_idx" ON "Job"("subject");
CREATE TABLE "new_TutorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "hourlyRateMinor" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "city" TEXT,
    "country" TEXT,
    "languages" JSONB NOT NULL,
    "subjects" JSONB NOT NULL,
    "skills" JSONB NOT NULL DEFAULT [],
    "modes" JSONB NOT NULL,
    "levels" JSONB NOT NULL,
    "teachingApproach" TEXT,
    "experience" TEXT,
    "education" TEXT,
    "hourlyRateMaxMinor" INTEGER,
    "freeTrialMinutes" INTEGER NOT NULL DEFAULT 0,
    "yearsTeaching" INTEGER,
    "yearsOnline" INTEGER,
    "gender" TEXT,
    "worksAs" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "ratingAvg" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "notifyMatching" BOOLEAN NOT NULL DEFAULT true,
    "photoUrl" TEXT,
    "rateType" TEXT NOT NULL DEFAULT 'HOURLY',
    CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TutorProfile" ("bio", "city", "country", "currency", "education", "experience", "freeTrialMinutes", "gender", "headline", "hourlyRateMaxMinor", "hourlyRateMinor", "id", "isPublished", "languages", "levels", "modes", "notifyMatching", "photoUrl", "rateType", "ratingAvg", "reviewCount", "slug", "subjects", "teachingApproach", "timezone", "userId", "worksAs", "yearsOnline", "yearsTeaching") SELECT "bio", "city", "country", "currency", "education", "experience", "freeTrialMinutes", "gender", "headline", "hourlyRateMaxMinor", "hourlyRateMinor", "id", "isPublished", "languages", "levels", "modes", "notifyMatching", "photoUrl", "rateType", "ratingAvg", "reviewCount", "slug", "subjects", "teachingApproach", "timezone", "userId", "worksAs", "yearsOnline", "yearsTeaching" FROM "TutorProfile";
DROP TABLE "TutorProfile";
ALTER TABLE "new_TutorProfile" RENAME TO "TutorProfile";
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "TutorProfile"("userId");
CREATE UNIQUE INDEX "TutorProfile_slug_key" ON "TutorProfile"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
