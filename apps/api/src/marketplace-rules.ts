const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL = /(https?:\/\/|www\.)[^\s]+/gi;
const APPS = /\b(whatsapp|telegram|signal|skype|zoom\.us|meet\.google|facetime)\b/gi;

export function containsContactLeak(text: string) {
  return [PHONE, EMAIL, URL, APPS].some((r) => {
    r.lastIndex = 0;
    return r.test(text);
  });
}

export function maskContact(text: string) {
  return text
    .replace(EMAIL, "[hidden email]")
    .replace(URL, "[hidden link]")
    .replace(PHONE, "[hidden number]")
    .replace(APPS, "[hidden app]");
}

export function currentCoinPrice(createdAt: Date, applyCount: number, now = new Date()) {
  const ageHours = (now.getTime() - createdAt.getTime()) / 36e5;
  if (applyCount < 3 && ageHours >= 36) return 0;
  if (applyCount === 0) return ageHours >= 36 ? 0 : 1;
  return Math.min(1 + applyCount, 80);
}

export function whatsappDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function normalizePhone(raw: string) {
  const trimmed = raw.trim();
  const digits = whatsappDigits(trimmed);
  if (digits.length < 10 || digits.length > 15) {
    throw new Error("Enter a valid phone with country code");
  }
  return trimmed.startsWith("+") ? trimmed : `+${digits}`;
}

export const STUDENT_STARTER_COINS = 150;
export const TUTOR_STARTER_COINS = 80;
export const REFERRAL_BONUS = 50;
export const PREMIUM_COST = 100;
export const PREMIUM_DAYS = 30;
export const EARLY_ACCESS_HOURS = 1;
export const STUDENT_MESSAGE_COST = 50;
export const CONTACT_UNLOCK_COST = 10;
export const UNREAD_REFUND_MS = 14 * 24 * 60 * 60 * 1000;
export const MAX_JOBS_PER_DAY = 5;

export const COIN_PACKS = [
  { coins: 50, amountMinor: 5000, label: "Starter", currency: "INR" },
  { coins: 200, amountMinor: 18000, label: "Plus", currency: "INR" },
  { coins: 500, amountMinor: 40000, label: "Pro", currency: "INR" },
] as const;

const SKILL_ALIASES: Record<string, string[]> = {
  maths: ["mathematics", "math"],
  mathematics: ["maths", "math"],
  math: ["maths", "mathematics"],
  eng: ["english"],
  english: ["eng"],
};

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

function getSkillVariants(skill: string): Set<string> {
  const normalized = normalizeSkill(skill);
  const variants = new Set([normalized]);
  if (SKILL_ALIASES[normalized]) {
    SKILL_ALIASES[normalized].forEach((alias) => variants.add(normalizeSkill(alias)));
  }
  return variants;
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export interface JobMatchResult {
  match: boolean;
  score: number;
}

export function isJobMatch(
  tutor: { skills?: string[]; subjects?: string[]; languages?: string[]; modes?: string[] },
  job: { subject?: string; languages?: string[]; modes?: string[] },
): JobMatchResult {
  const tutorSkills = new Set<string>();
  if (tutor.skills) {
    tutor.skills.forEach((s) => {
      getSkillVariants(s).forEach((v) => tutorSkills.add(v));
    });
  }
  if (tutor.subjects) {
    tutor.subjects.forEach((s) => {
      getSkillVariants(s).forEach((v) => tutorSkills.add(v));
    });
  }
  if (tutorSkills.size === 0) {
    return { match: false, score: 0 };
  }

  const jobSkills = new Set<string>();
  if (job.subject) {
    getSkillVariants(job.subject).forEach((v) => jobSkills.add(v));
  }
  if (jobSkills.size === 0) {
    return { match: false, score: 0 };
  }

  const skillScore = jaccardSimilarity(tutorSkills, jobSkills);
  if (skillScore < 0.35) {
    return { match: false, score: skillScore };
  }

  if (job.languages && job.languages.length > 0) {
    const tutorLangs = new Set((tutor.languages || []).map((l) => l.toLowerCase()));
    const jobLangs = new Set(job.languages.map((l) => l.toLowerCase()));
    const hasCommonLang = [...jobLangs].some((lang) => tutorLangs.has(lang));
    if (!hasCommonLang) {
      return { match: false, score: skillScore };
    }
  }

  if (job.modes && job.modes.length > 0) {
    const tutorModes = new Set((tutor.modes || []).map((m) => m.toUpperCase()));
    const jobModes = new Set(job.modes.map((m) => m.toUpperCase()));
    const hasCommonMode = [...jobModes].some((mode) => tutorModes.has(mode));
    if (!hasCommonMode) {
      return { match: false, score: skillScore };
    }
  }

  return { match: true, score: skillScore };
}
