import { PrismaClient, Role, TeachingMode, JobType, JobVisibility } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // ============================================
  // TUTORS - Diverse subjects, locations, rates
  // ============================================
  const tutors = [
    {
      email: "amina@gurumates.dev",
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
      ratingAvg: 4.9,
      reviewCount: 47,
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
      email: "dev@gurumates.dev",
      phone: "+919820011223",
      name: "Dev Patel",
      slug: "dev-patel",
      headline: "Python & data science for beginners",
      bio: "Software engineer who teaches by building small projects with you. No jargon wall. From basics to pandas, numpy, and ML fundamentals.",
      hourlyRateMinor: 2800,
      city: "Mumbai",
      country: "India",
      timezone: "Asia/Kolkata",
      subjects: ["Python", "Computer Science", "Data Science"],
      modes: [TeachingMode.ONLINE, TeachingMode.ASSIGNMENT],
      levels: ["Undergraduate", "Professional"],
      languages: ["English", "Hindi"],
      ratingAvg: 4.8,
      reviewCount: 62,
      teachingApproach: "Project-based learning\nHands-on coding every session\nReal-world examples",
      experience: "Senior Software Engineer at tech startup. Teaching Python since 2019.",
      education: "BTech Computer Science, IIT Bombay",
      yearsTeaching: 5,
      yearsOnline: 5,
      gender: "MALE",
      worksAs: "INDIVIDUAL",
    },
    {
      email: "sarah@gurumates.dev",
      phone: "+442071234567",
      name: "Sarah Collins",
      slug: "sarah-collins",
      headline: "Home tutor for GCSE English, London",
      bio: "Patient literature teacher. I travel within Zone 2 or teach at your kitchen table. Specializing in essay writing and comprehension.",
      hourlyRateMinor: 4000,
      city: "London",
      country: "UK",
      timezone: "Europe/London",
      subjects: ["English", "Literature"],
      modes: [TeachingMode.HOME, TeachingMode.TRAVEL, TeachingMode.ONLINE],
      levels: ["School", "High school"],
      languages: ["English"],
      ratingAvg: 4.7,
      reviewCount: 31,
      teachingApproach: "Close reading techniques\nEssay structure workshops\nExam practice with feedback",
      experience: "English teacher at secondary school for 8 years. Private tutoring since 2018.",
      education: "MA English Literature, UCL",
      yearsTeaching: 8,
      yearsOnline: 3,
      gender: "FEMALE",
      worksAs: "INDIVIDUAL",
    },
    {
      email: "kenji@gurumates.dev",
      phone: "+6591234567",
      name: "Kenji Sato",
      slug: "kenji-sato",
      headline: "SAT & GRE quantitative, Asia evenings",
      bio: "Former test-prep lead. Structured drills plus error logs after every session. 99th percentile scorer.",
      hourlyRateMinor: 3200,
      city: "Singapore",
      country: "Singapore",
      timezone: "Asia/Singapore",
      subjects: ["SAT", "GRE", "Mathematics"],
      modes: [TeachingMode.ONLINE],
      levels: ["Test prep"],
      languages: ["English", "Japanese"],
      ratingAvg: 4.9,
      reviewCount: 90,
      teachingApproach: "Timed practice tests\nError analysis and tracking\nStrategy optimization",
      experience: "Test prep instructor at Kaplan (2015-2020). Independent tutor since 2020.",
      education: "MBA, NUS Singapore",
      yearsTeaching: 9,
      yearsOnline: 7,
      gender: "MALE",
      worksAs: "INDIVIDUAL",
    },
    {
      email: "fatima@gurumates.dev",
      phone: "+971501234567",
      name: "Fatima Al-Hassan",
      slug: "fatima-al-hassan",
      headline: "Chemistry assignment help & lab reports",
      bio: "MSc Chemistry. I review structure, citations, and calculations — I do not write the paper for you. Organic and inorganic chemistry specialist.",
      hourlyRateMinor: 2500,
      city: "Dubai",
      country: "UAE",
      timezone: "Asia/Dubai",
      subjects: ["Chemistry", "Organic Chemistry"],
      modes: [TeachingMode.ONLINE, TeachingMode.ASSIGNMENT],
      levels: ["Undergraduate", "Graduate"],
      languages: ["English", "Arabic"],
      ratingAvg: 4.6,
      reviewCount: 22,
      teachingApproach: "Concept clarification\nLab report structure guidance\nProblem-solving techniques",
      experience: "Research assistant and teaching assistant at university for 4 years.",
      education: "MSc Chemistry, American University of Sharjah",
      yearsTeaching: 4,
      yearsOnline: 4,
      gender: "FEMALE",
      worksAs: "INDIVIDUAL",
    },
    {
      email: "marco@gurumates.dev",
      phone: "+447700900123",
      name: "Marco Rossi",
      slug: "marco-rossi",
      headline: "Piano from first notes to grade 5",
      bio: "In-person lessons at my studio or your home. Online for theory and practice reviews. Classical and contemporary styles.",
      hourlyRateMinor: 4500,
      city: "London",
      country: "UK",
      timezone: "Europe/London",
      subjects: ["Piano", "Music Theory"],
      modes: [TeachingMode.HOME, TeachingMode.ONLINE, TeachingMode.TRAVEL],
      levels: ["School", "Professional"],
      languages: ["English", "Italian"],
      ratingAvg: 5,
      reviewCount: 17,
      teachingApproach: "Technique fundamentals\nSight-reading practice\nPerformance preparation",
      experience: "Concert pianist and music teacher for 12 years.",
      education: "BMus Piano Performance, Royal Academy of Music",
      yearsTeaching: 12,
      yearsOnline: 2,
      gender: "MALE",
      worksAs: "INDIVIDUAL",
    },
    {
      email: "priya.t@gurumates.dev",
      phone: "+919876500001",
      name: "Priya Sharma",
      slug: "priya-sharma",
      headline: "CBSE & ICSE Maths, Class 8-12",
      bio: "Experienced school teacher. I make maths simple with step-by-step explanations. Board exam preparation specialist.",
      hourlyRateMinor: 800,
      city: "Delhi",
      country: "India",
      timezone: "Asia/Kolkata",
      subjects: ["Mathematics", "Algebra", "Calculus"],
      modes: [TeachingMode.ONLINE, TeachingMode.HOME],
      levels: ["School", "High school"],
      languages: ["English", "Hindi"],
      ratingAvg: 4.7,
      reviewCount: 85,
      teachingApproach: "Step-by-step problem solving\nBoard exam pattern practice\nWeekly tests",
      experience: "Maths teacher at DPS for 15 years. Private tuitions since 2010.",
      education: "MSc Mathematics, Delhi University",
      yearsTeaching: 15,
      yearsOnline: 4,
      gender: "FEMALE",
      worksAs: "INDIVIDUAL",
    },
    {
      email: "john.w@gurumates.dev",
      phone: "+14155550123",
      name: "John Williams",
      slug: "john-williams",
      headline: "Spanish for beginners to advanced",
      bio: "Native speaker from Mexico. Conversational Spanish, business Spanish, and exam prep (DELE). Fun and interactive lessons.",
      hourlyRateMinor: 3000,
      city: "San Francisco",
      country: "USA",
      timezone: "America/Los_Angeles",
      subjects: ["Spanish", "Languages"],
      modes: [TeachingMode.ONLINE],
      levels: ["School", "Professional"],
      languages: ["English", "Spanish"],
      ratingAvg: 4.8,
      reviewCount: 43,
      teachingApproach: "Immersive conversation practice\nCultural context learning\nGrammar through usage",
      experience: "Language instructor for 7 years. Certified DELE examiner.",
      education: "BA Spanish Literature, UNAM Mexico",
      yearsTeaching: 7,
      yearsOnline: 5,
      gender: "MALE",
      worksAs: "INDIVIDUAL",
    },
  ];

  const tutorUsers: { id: string; email: string; slug: string }[] = [];

  for (const t of tutors) {
    const user = await prisma.user.upsert({
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
        referralCode: `gm-${t.slug.slice(0, 8)}`,
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
            currency: t.country === "India" ? "INR" : t.country === "UK" ? "GBP" : "USD",
            teachingApproach: t.teachingApproach,
            experience: t.experience,
            education: t.education,
            hourlyRateMaxMinor: t.hourlyRateMaxMinor,
            freeTrialMinutes: t.freeTrialMinutes ?? 0,
            yearsTeaching: t.yearsTeaching,
            yearsOnline: t.yearsOnline,
            gender: t.gender,
            worksAs: t.worksAs ?? "INDIVIDUAL",
          },
        },
      },
      include: { tutorProfile: true },
    });
    tutorUsers.push({ id: user.id, email: user.email, slug: user.tutorProfile?.slug ?? t.slug });
  }

  // ============================================
  // STUDENTS - Different locations and needs
  // ============================================
  const students = [
    {
      email: "student@gurumates.dev",
      phone: "+919876543210",
      name: "Priya Shah",
      city: "Mumbai",
      country: "India",
    },
    {
      email: "alex.student@gurumates.dev",
      phone: "+12125559999",
      name: "Alex Johnson",
      city: "New York",
      country: "USA",
    },
    {
      email: "emma.student@gurumates.dev",
      phone: "+447700900999",
      name: "Emma Thompson",
      city: "London",
      country: "UK",
    },
    {
      email: "raj.student@gurumates.dev",
      phone: "+919876500099",
      name: "Raj Kumar",
      city: "Delhi",
      country: "India",
    },
  ];

  const studentUsers: { id: string; email: string; name: string }[] = [];

  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { phone: s.phone, emailVerifiedAt: new Date(), phoneVerifiedAt: new Date() },
      create: {
        email: s.email,
        passwordHash,
        name: s.name,
        phone: s.phone,
        dateOfBirth: new Date("2004-06-01"),
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roles: [Role.STUDENT],
        activeRole: Role.STUDENT,
        referralCode: `gm-${s.email.split("@")[0].slice(0, 8)}`,
        studentProfile: { create: { city: s.city, country: s.country } },
      },
    });
    studentUsers.push({ id: user.id, email: user.email, name: user.name });
  }

  // ============================================
  // JOBS - Variety of requirements
  // ============================================
  const jobsData = [
    {
      studentEmail: "student@gurumates.dev",
      title: "Need AP Physics tutor Saturday afternoons",
      description: "Class 12 student. Struggling with rotational motion and need weekly online sessions under $40/hr. Looking for someone patient who can explain concepts clearly.",
      type: JobType.TUTORING,
      modes: [TeachingMode.ONLINE],
      subject: "Physics",
      level: "High school",
      city: "New York",
      country: "USA",
      currency: "USD",
      budgetMin: 2500,
      budgetMax: 4000,
      whenNeeded: "THIS_WEEK",
      frequency: "WEEKLY",
    },
    {
      studentEmail: "student@gurumates.dev",
      title: "Python project review this week",
      description: "Need help structuring a pandas assignment and explaining the approach. Online, two sessions. Must know data visualization with matplotlib.",
      type: JobType.ASSIGNMENT,
      modes: [TeachingMode.ONLINE, TeachingMode.ASSIGNMENT],
      subject: "Python",
      level: "Undergraduate",
      city: "Mumbai",
      country: "India",
      currency: "INR",
      budgetMin: 2000,
      budgetMax: 3000,
      whenNeeded: "ASAP",
      frequency: "ONCE",
    },
    {
      studentEmail: "emma.student@gurumates.dev",
      title: "GCSE English home tutor, Zone 2",
      description: "Twice a week after school. Prefer in-person in London. Need help with essay writing and literature analysis for upcoming exams.",
      type: JobType.TUTORING,
      modes: [TeachingMode.HOME],
      subject: "English",
      level: "High school",
      city: "London",
      country: "UK",
      currency: "GBP",
      budgetMin: 3500,
      budgetMax: 5000,
      whenNeeded: "THIS_WEEK",
      frequency: "WEEKLY",
    },
    {
      studentEmail: "alex.student@gurumates.dev",
      title: "SAT Math prep - targeting 750+",
      description: "Taking SAT in 3 months. Currently scoring around 680. Need intensive practice and strategy tips. Prefer evenings EST.",
      type: JobType.TUTORING,
      modes: [TeachingMode.ONLINE],
      subject: "SAT",
      level: "Test prep",
      city: "New York",
      country: "USA",
      currency: "USD",
      budgetMin: 3000,
      budgetMax: 4500,
      whenNeeded: "THIS_WEEK",
      frequency: "WEEKLY",
    },
    {
      studentEmail: "raj.student@gurumates.dev",
      title: "Class 10 Maths - Board exam preparation",
      description: "Need help with algebra and geometry. CBSE board. Looking for regular classes 3 times a week. Hindi medium preferred.",
      type: JobType.TUTORING,
      modes: [TeachingMode.ONLINE, TeachingMode.HOME],
      subject: "Mathematics",
      level: "High school",
      city: "Delhi",
      country: "India",
      currency: "INR",
      budgetMin: 500,
      budgetMax: 1000,
      whenNeeded: "FLEXIBLE",
      frequency: "DAILY",
    },
    {
      studentEmail: "alex.student@gurumates.dev",
      title: "Spanish conversation practice",
      description: "Intermediate level. Want to improve speaking fluency for upcoming trip to Spain. 1-2 sessions per week.",
      type: JobType.TUTORING,
      modes: [TeachingMode.ONLINE],
      subject: "Spanish",
      level: "Professional",
      city: "San Francisco",
      country: "USA",
      currency: "USD",
      budgetMin: 2500,
      budgetMax: 3500,
      whenNeeded: "FLEXIBLE",
      frequency: "WEEKLY",
    },
    {
      studentEmail: "emma.student@gurumates.dev",
      title: "Piano lessons for beginner adult",
      description: "Always wanted to learn piano. Complete beginner. Looking for patient teacher who can come to my home in West London.",
      type: JobType.TUTORING,
      modes: [TeachingMode.HOME, TeachingMode.TRAVEL],
      subject: "Piano",
      level: "School",
      city: "London",
      country: "UK",
      currency: "GBP",
      budgetMin: 4000,
      budgetMax: 5500,
      whenNeeded: "FLEXIBLE",
      frequency: "WEEKLY",
    },
    {
      studentEmail: "student@gurumates.dev",
      title: "Chemistry lab report help",
      description: "Need guidance on structuring my organic chemistry lab report. Not looking for someone to write it, just help with format and analysis.",
      type: JobType.ASSIGNMENT,
      modes: [TeachingMode.ONLINE, TeachingMode.ASSIGNMENT],
      subject: "Chemistry",
      level: "Undergraduate",
      city: "Mumbai",
      country: "India",
      currency: "INR",
      budgetMin: 1500,
      budgetMax: 2500,
      whenNeeded: "ASAP",
      frequency: "ONCE",
    },
  ];

  const createdJobs: { id: string; studentId: string; subject: string }[] = [];

  for (let i = 0; i < jobsData.length; i++) {
    const j = jobsData[i];
    const student = studentUsers.find((s) => s.email === j.studentEmail);
    if (!student) continue;

    const existingJob = await prisma.job.findFirst({
      where: { studentId: student.id, title: j.title },
    });

    if (!existingJob) {
      const job = await prisma.job.create({
        data: {
          studentId: student.id,
          title: j.title,
          description: j.description,
          type: j.type,
          modes: j.modes,
          visibility: JobVisibility.PUBLIC,
          subject: j.subject,
          level: j.level,
          city: j.city,
          country: j.country,
          currency: j.currency,
          budgetMin: j.budgetMin,
          budgetMax: j.budgetMax,
          whenNeeded: j.whenNeeded,
          frequency: j.frequency,
          createdAt: new Date(Date.now() - (i + 1) * 3600000),
        },
      });
      createdJobs.push({ id: job.id, studentId: student.id, subject: j.subject });
    }
  }

  // ============================================
  // CONVERSATIONS & MESSAGES - Demo interactions
  // ============================================
  const priya = studentUsers.find((s) => s.email === "student@gurumates.dev");
  const dev = tutorUsers.find((t) => t.email === "dev@gurumates.dev");

  if (priya && dev) {
    const existingConvo = await prisma.conversation.findFirst({
      where: { studentId: priya.id, tutorId: dev.id },
    });

    if (!existingConvo) {
      const convo = await prisma.conversation.create({
        data: {
          threadKey: `${priya.id}-${dev.id}`,
          studentId: priya.id,
          tutorId: dev.id,
          contactUnlocked: true,
          messages: {
            create: [
              {
                senderId: priya.id,
                body: "Hi Dev! I saw your profile and I need help with my Python pandas assignment. Are you available this week?",
                createdAt: new Date(Date.now() - 86400000),
              },
              {
                senderId: dev.id,
                body: "Hi Priya! Yes, I'd be happy to help. Can you tell me more about the assignment? What topics does it cover?",
                createdAt: new Date(Date.now() - 82800000),
              },
              {
                senderId: priya.id,
                body: "It's about data cleaning and visualization. I need to analyze a CSV file and create some charts with matplotlib.",
                createdAt: new Date(Date.now() - 79200000),
              },
              {
                senderId: dev.id,
                body: "Perfect, that's exactly what I specialize in. I can help you understand the approach and guide you through the code. When would you like to schedule our first session?",
                createdAt: new Date(Date.now() - 75600000),
              },
              {
                senderId: priya.id,
                body: "How about tomorrow evening around 7 PM IST?",
                createdAt: new Date(Date.now() - 72000000),
              },
              {
                senderId: dev.id,
                body: "That works for me! I'll send you a Google Meet link. Looking forward to it.",
                createdAt: new Date(Date.now() - 68400000),
              },
            ],
          },
        },
      });

      // Create a completed booking with review
      const booking = await prisma.booking.create({
        data: {
          conversationId: convo.id,
          studentId: priya.id,
          tutorId: dev.id,
          startsAt: new Date(Date.now() - 43200000),
          durationMin: 60,
          amountMinor: 2800,
          currency: "INR",
          status: "COMPLETED",
        },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          fromId: priya.id,
          toId: dev.id,
          rating: 5,
          body: "Dev was incredibly helpful! He explained pandas concepts clearly and helped me understand my assignment. Highly recommend!",
        },
      });
    }
  }

  // Another conversation - Emma and Sarah
  const emma = studentUsers.find((s) => s.email === "emma.student@gurumates.dev");
  const sarah = tutorUsers.find((t) => t.email === "sarah@gurumates.dev");

  if (emma && sarah) {
    const existingConvo = await prisma.conversation.findFirst({
      where: { studentId: emma.id, tutorId: sarah.id },
    });

    if (!existingConvo) {
      await prisma.conversation.create({
        data: {
          threadKey: `${emma.id}-${sarah.id}`,
          studentId: emma.id,
          tutorId: sarah.id,
          contactUnlocked: false,
          messages: {
            create: [
              {
                senderId: emma.id,
                body: "Hi Sarah! I'm looking for a GCSE English tutor. I saw you travel within Zone 2 - I'm in Notting Hill. Would that work?",
                createdAt: new Date(Date.now() - 36000000),
              },
              {
                senderId: sarah.id,
                body: "Hello Emma! Yes, Notting Hill is perfect - I'm based in Kensington so it's very close. What areas of English do you need help with?",
                createdAt: new Date(Date.now() - 32400000),
              },
              {
                senderId: emma.id,
                body: "Mainly essay writing and literature analysis. I have my mocks coming up in 2 months.",
                createdAt: new Date(Date.now() - 28800000),
              },
            ],
          },
        },
      });
    }
  }

  // ============================================
  // ADMIN USER
  // ============================================
  await prisma.user.upsert({
    where: { email: "admin@gurumates.dev" },
    update: { phone: "+15551234567", emailVerifiedAt: new Date(), phoneVerifiedAt: new Date() },
    create: {
      email: "admin@gurumates.dev",
      passwordHash,
      name: "gurumates Admin",
      phone: "+15551234567",
      dateOfBirth: new Date("1990-01-01"),
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      roles: [Role.ADMIN, Role.STUDENT],
      activeRole: Role.STUDENT,
      referralCode: "gm-admin001",
      studentProfile: { create: {} },
    },
  });

  // ============================================
  // WALLETS - Ensure all users have wallets
  // ============================================
  const allUsers = await prisma.user.findMany({ include: { wallet: true, tutorProfile: true } });
  for (const u of allUsers) {
    if (!u.wallet) {
      const isTutor = Boolean(u.tutorProfile);
      const coins = u.email.includes("admin") ? 500 : isTutor ? 200 : 150;
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
  }

  // ============================================
  // UPDATE TUTOR RATINGS FROM REVIEWS
  // ============================================
  const tutorsWithProfiles = await prisma.user.findMany({
    where: { tutorProfile: { isNot: null } },
    include: { tutorProfile: true },
  });

  for (const u of tutorsWithProfiles) {
    if (u.tutorProfile) {
      const stats = await prisma.review.aggregate({
        where: { toId: u.id },
        _avg: { rating: true },
        _count: true,
      });
      if (stats._count > 0) {
        await prisma.tutorProfile.update({
          where: { id: u.tutorProfile.id },
          data: { ratingAvg: stats._avg.rating ?? 0, reviewCount: stats._count },
        });
      }
    }
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    gurumates Demo Data Seeded                  ║
╠════════════════════════════════════════════════════════════════╣
║  Password for all accounts: password123                        ║
╠════════════════════════════════════════════════════════════════╣
║  STUDENTS:                                                     ║
║    • student@gurumates.dev (Priya Shah - Mumbai)               ║
║    • alex.student@gurumates.dev (Alex Johnson - New York)      ║
║    • emma.student@gurumates.dev (Emma Thompson - London)       ║
║    • raj.student@gurumates.dev (Raj Kumar - Delhi)             ║
╠════════════════════════════════════════════════════════════════╣
║  TUTORS:                                                       ║
║    • amina@gurumates.dev (Physics/Maths - New York)            ║
║    • dev@gurumates.dev (Python/Data Science - Mumbai)          ║
║    • sarah@gurumates.dev (English - London)                    ║
║    • kenji@gurumates.dev (SAT/GRE - Singapore)                 ║
║    • fatima@gurumates.dev (Chemistry - Dubai)                  ║
║    • marco@gurumates.dev (Piano - London)                      ║
║    • priya.t@gurumates.dev (Maths CBSE - Delhi)                ║
║    • john.w@gurumates.dev (Spanish - San Francisco)            ║
╠════════════════════════════════════════════════════════════════╣
║  ADMIN:                                                        ║
║    • admin@gurumates.dev                                       ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
