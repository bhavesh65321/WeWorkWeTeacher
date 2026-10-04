import { PrismaClient, Role, TeachingMode, JobType, JobVisibility } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const tutors = [
    {
      email: "amina@wtws.dev",
      phone: "+12125550191",
      name: "Amina Rahman",
      slug: "amina-rahman",
      headline: "AP Physics & IB Maths, evenings EST",
      bio: "10 years helping high-school students build confidence in mechanics and calculus. Clear, calm, exam-focused.",
      hourlyRateMinor: 3500,
      city: "New York",
      country: "USA",
      timezone: "America/New_York",
      subjects: ["Physics", "Mathematics"],
      modes: [TeachingMode.ONLINE],
      levels: ["High school", "Test prep"],
      languages: ["English"],
      ratingAvg: 0,
      reviewCount: 0,
      teachingApproach: "Concept-first learning\nPast-paper drills\nCalm, exam-focused sessions",
      experience: "Physics teacher (2016—Present). AP and IB mechanics, electricity, and calculus-based physics.",
      education: "MSc Physics, Columbia University",
      hourlyRateMaxMinor: 4500,
      freeTrialMinutes: 60,
      yearsTeaching: 10,
      yearsOnline: 6,
      gender: "FEMALE",
      worksAs: "INDIVIDUAL",
    },
    {
      email: "dev@wtws.dev",
      phone: "+919820011223",
      name: "Dev Patel",
      slug: "dev-patel",
      headline: "Python & data science for beginners",
      bio: "Software engineer who teaches by building small projects with you. No jargon wall.",
      hourlyRateMinor: 2800,
      city: "Mumbai",
      country: "India",
      timezone: "Asia/Kolkata",
      subjects: ["Python", "Computer Science"],
      modes: [TeachingMode.ONLINE, TeachingMode.ASSIGNMENT],
      levels: ["Undergraduate", "Professional"],
      languages: ["English", "Hindi"],
      ratingAvg: 4.8,
      reviewCount: 62,
    },
    {
      email: "sarah@wtws.dev",
      phone: "+442071234567",
      name: "Sarah Collins",
      slug: "sarah-collins",
      headline: "Home tutor for GCSE English, London",
      bio: "Patient literature teacher. I travel within Zone 2 or teach at your kitchen table.",
      hourlyRateMinor: 4000,
      city: "London",
      country: "UK",
      timezone: "Europe/London",
      subjects: ["English"],
      modes: [TeachingMode.HOME, TeachingMode.TRAVEL],
      levels: ["School", "High school"],
      languages: ["English"],
      ratingAvg: 4.7,
      reviewCount: 31,
    },
    {
      email: "kenji@wtws.dev",
      phone: "+6591234567",
      name: "Kenji Sato",
      slug: "kenji-sato",
      headline: "SAT & GRE quantitative, Asia evenings",
      bio: "Former test-prep lead. Structured drills plus error logs after every session.",
      hourlyRateMinor: 3200,
      city: "Singapore",
      country: "Singapore",
      timezone: "Asia/Singapore",
      subjects: ["SAT", "Mathematics"],
      modes: [TeachingMode.ONLINE],
      levels: ["Test prep"],
      languages: ["English", "Japanese"],
      ratingAvg: 4.9,
      reviewCount: 90,
    },
    {
      email: "fatima@wtws.dev",
      phone: "+971501234567",
      name: "Fatima Al-Hassan",
      slug: "fatima-al-hassan",
      headline: "Chemistry assignment help & lab reports",
      bio: "MSc Chemistry. I review structure, citations, and calculations — I do not write the paper for you.",
      hourlyRateMinor: 2500,
      city: "Dubai",
      country: "UAE",
      timezone: "Asia/Dubai",
      subjects: ["Chemistry"],
      modes: [TeachingMode.ONLINE, TeachingMode.ASSIGNMENT],
      levels: ["Undergraduate", "Graduate"],
      languages: ["English", "Arabic"],
      ratingAvg: 4.6,
      reviewCount: 22,
    },
    {
      email: "marco@wtws.dev",
      phone: "+447700900123",
      name: "Marco Rossi",
      slug: "marco-rossi",
      headline: "Piano from first notes to grade 5",
      bio: "In-person lessons at my studio or your home. Online for theory and practice reviews.",
      hourlyRateMinor: 4500,
      city: "London",
      country: "UK",
      timezone: "Europe/London",
      subjects: ["Piano", "Music"],
      modes: [TeachingMode.HOME, TeachingMode.ONLINE, TeachingMode.TRAVEL],
      levels: ["School", "Professional"],
      languages: ["English", "Italian"],
      ratingAvg: 5,
      reviewCount: 17,
    },
  ];

  for (const t of tutors) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: { phone: t.phone, emailVerifiedAt: new Date(), phoneVerifiedAt: new Date() },
      create: {
        email: t.email,
        passwordHash,
        name: t.name,
        phone: t.phone,
        dateOfBirth: new Date("1990-01-15"),
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roles: [Role.STUDENT, Role.TUTOR],
        activeRole: Role.TUTOR,
        studentProfile: { create: { city: t.city, country: t.country } },
        tutorProfile: {
          create: {
            slug: t.slug,
            headline: t.headline,
            bio: t.bio,
            hourlyRateMinor: t.hourlyRateMinor,
            city: t.city,
            country: t.country,
            timezone: t.timezone,
            subjects: t.subjects,
            modes: t.modes,
            levels: t.levels,
            languages: t.languages,
            ratingAvg: t.ratingAvg,
            reviewCount: t.reviewCount,
            currency: t.country === "India" ? "INR" : "USD",
            teachingApproach: "teachingApproach" in t ? t.teachingApproach : undefined,
            experience: "experience" in t ? t.experience : undefined,
            education: "education" in t ? t.education : undefined,
            hourlyRateMaxMinor: "hourlyRateMaxMinor" in t ? t.hourlyRateMaxMinor : undefined,
            freeTrialMinutes: "freeTrialMinutes" in t ? t.freeTrialMinutes : 0,
            yearsTeaching: "yearsTeaching" in t ? t.yearsTeaching : undefined,
            yearsOnline: "yearsOnline" in t ? t.yearsOnline : undefined,
            gender: "gender" in t ? t.gender : undefined,
            worksAs: "worksAs" in t ? t.worksAs : "INDIVIDUAL",
          },
        },
      },
    });
  }

  await prisma.tutorProfile.updateMany({
    where: { slug: "amina-rahman" },
    data: {
      teachingApproach: "Concept-first learning\nPast-paper drills\nCalm, exam-focused sessions",
      experience: "Physics teacher (2016—Present). AP and IB mechanics, electricity, and calculus-based physics.",
      education: "MSc Physics, Columbia University",
      hourlyRateMaxMinor: 4500,
      freeTrialMinutes: 60,
      yearsTeaching: 10,
      yearsOnline: 6,
      gender: "FEMALE",
      worksAs: "INDIVIDUAL",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@wtws.dev" },
    update: { phone: "+919876543210", emailVerifiedAt: new Date(), phoneVerifiedAt: new Date() },
    create: {
      email: "student@wtws.dev",
      passwordHash,
      name: "Priya Shah",
      phone: "+919876543210",
      dateOfBirth: new Date("2004-06-01"),
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      roles: [Role.STUDENT],
      activeRole: Role.STUDENT,
      studentProfile: { create: { city: "Mumbai", country: "India" } },
    },
  });

  const existingJobs = await prisma.job.count();
  if (existingJobs === 0) {
    await prisma.job.createMany({
      data: [
        {
          studentId: student.id,
          title: "Need AP Physics tutor Saturday afternoons",
          description:
            "Class 12 student. Struggling with rotational motion and need weekly online sessions under $40/hr.",
          type: JobType.TUTORING,
          modes: [TeachingMode.ONLINE],
          visibility: JobVisibility.PUBLIC,
          subject: "Physics",
          level: "High school",
          city: "New York",
          country: "USA",
          currency: "USD",
          budgetMin: 2500,
          budgetMax: 4000,
          createdAt: new Date(Date.now() - 2 * 36e5),
        },
        {
          studentId: student.id,
          title: "Python project review this week",
          description:
            "Need help structuring a pandas assignment and explaining the approach. Online, two sessions.",
          type: JobType.ASSIGNMENT,
          modes: [TeachingMode.ONLINE, TeachingMode.ASSIGNMENT],
          visibility: JobVisibility.PUBLIC,
          subject: "Python",
          level: "Undergraduate",
          city: "Mumbai",
          country: "India",
          currency: "INR",
          budgetMin: 2000,
          budgetMax: 3000,
        },
        {
          studentId: student.id,
          title: "GCSE English home tutor, Zone 2",
          description: "Twice a week after school. Prefer in-person in London.",
          type: JobType.TUTORING,
          modes: [TeachingMode.HOME],
          visibility: JobVisibility.PUBLIC,
          subject: "English",
          level: "High school",
          city: "London",
          country: "UK",
          currency: "GBP",
          budgetMin: 3500,
          budgetMax: 5000,
        },
      ],
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@wtws.dev" },
    update: { phone: "+15551234567", emailVerifiedAt: new Date(), phoneVerifiedAt: new Date() },
    create: {
      email: "admin@wtws.dev",
      passwordHash,
      name: "WTWS Admin",
      phone: "+15551234567",
      dateOfBirth: new Date("1990-01-01"),
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      roles: [Role.ADMIN, Role.STUDENT],
      activeRole: Role.STUDENT,
      studentProfile: { create: {} },
    },
  });

  const allUsers = await prisma.user.findMany({ include: { wallet: true, tutorProfile: true } });
  for (const u of allUsers) {
    if (!u.referralCode) {
      await prisma.user.update({
        where: { id: u.id },
        data: { referralCode: `wtws-${u.id.slice(-8)}` },
      });
    }
    if (!u.wallet) {
      const coins = u.email === "student@wtws.dev" ? 150 : u.tutorProfile ? 200 : 150;
      await prisma.wallet.create({
        data: {
          userId: u.id,
          coinBalance: coins,
          entries: {
            create: { amount: coins, unit: "COIN", type: "STARTER", note: "Seed coins" },
          },
        },
      });
    }
    if (u.tutorProfile) {
      const stats = await prisma.review.aggregate({
        where: { toId: u.id },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.tutorProfile.update({
        where: { id: u.tutorProfile.id },
        data: { ratingAvg: stats._avg.rating ?? 0, reviewCount: stats._count },
      });
    }
  }
  void admin;

  console.log("Seeded WTWS demo users. Password for all: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
