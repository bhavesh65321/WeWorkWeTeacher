// Mirrors apps/api/src/content-rules.ts and marketplace-rules.ts (the API cannot import @wtws/shared). Keep in sync.
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const OBFUSCATED_EMAIL = /\b[\w.+-]+\s*(?:\(at\)|\[at\]|\bat\b)\s*[\w-]+\s*(?:\(dot\)|\[dot\]|\bdot\b)\s*[a-z]{2,}\b/gi;
const SPELLED_NUMBER = /\b(?:(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s,-]+){7,}(?:zero|one|two|three|four|five|six|seven|eight|nine)\b/gi;
const URL = /(https?:\/\/|www\.)[^\s]+/gi;
const APPS = /\b(whatsapp|telegram|signal|skype|zoom\.us|meet\.google|facetime)\b/gi;

const LEAK_PATTERNS = [PHONE, EMAIL, OBFUSCATED_EMAIL, SPELLED_NUMBER, URL, APPS];

export function containsContactLeak(text: string) {
  return LEAK_PATTERNS.some((r) => {
    r.lastIndex = 0;
    return r.test(text);
  });
}


export const MIN_REQUIREMENT_WORDS = 10;

const LEET_MAP: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

function normalizeForProfanity(text: string) {
  return text
    .toLowerCase()
    .replace(/[013457@$]/g, (c) => LEET_MAP[c])
    .replace(/[^a-z\s]/g, "")
    .replace(/(.)\1+/g, "$1");
}

const BLOCKED_WORDS = new Set(
  [
    "fuck", "fucker", "fucking", "shit", "bitch", "bastard", "asshole", "dick", "pussy", "slut", "whore",
    "cunt", "nigger", "porn", "sexy", "nude", "xxx", "escort", "rape", "cock", "boobs",
    "madarchod", "behenchod", "bhenchod", "chutiya", "chutiye", "gandu", "harami", "randi", "bhosdi", "bsdk",
  ].map(normalizeForProfanity),
);

export function containsProfanity(text: string) {
  return normalizeForProfanity(text)
    .split(/\s+/)
    .some((word) => BLOCKED_WORDS.has(word));
}

export function countWords(text: string) {
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

export function skillError(skill: string): string | null {
  const value = skill.trim();
  const letters = value.match(/\p{L}/gu)?.length ?? 0;
  if (value.length < 2 || value.length > 40) return "Skill must be 2-40 characters";
  if (letters < 1 || !/^[\p{L}\p{N}][\p{L}\p{M}\p{N} .&+#/'-]*$/u.test(value)) {
    return `"${value}" is not a valid subject or skill`;
  }
  if (containsContactLeak(value)) return "Skills can't contain contact details";
  if (containsProfanity(value)) return "Please use appropriate words in skills";
  return null;
}
