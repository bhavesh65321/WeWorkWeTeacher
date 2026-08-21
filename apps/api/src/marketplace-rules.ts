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
export const UNREAD_REFUND_MS = 14 * 24 * 60 * 60 * 1000;
export const MAX_JOBS_PER_DAY = 5;
export const PLATFORM_TAKE_BPS = 1200;

export const COIN_PACKS = [
  { coins: 50, amountMinor: 500, label: "Starter" },
  { coins: 200, amountMinor: 1800, label: "Plus" },
  { coins: 500, amountMinor: 4000, label: "Pro" },
] as const;

export function platformFee(amountMinor: number) {
  return Math.round((amountMinor * PLATFORM_TAKE_BPS) / 10_000);
}
