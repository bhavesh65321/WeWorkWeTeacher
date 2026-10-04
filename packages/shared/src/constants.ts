export const ROLES = ["STUDENT", "TUTOR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const TEACHING_MODES = ["ONLINE", "HOME", "TRAVEL", "ASSIGNMENT"] as const;
export type TeachingMode = (typeof TEACHING_MODES)[number];

export const JOB_TYPES = ["TUTORING", "ASSIGNMENT"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_VISIBILITY = ["PUBLIC", "PRIVATE"] as const;
export type JobVisibility = (typeof JOB_VISIBILITY)[number];

export const JOB_STATUSES = ["OPEN", "CLOSED", "FILLED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const LEVELS = ["School", "High school", "Undergraduate", "Graduate", "Professional", "Test prep"] as const;
export type Level = (typeof LEVELS)[number];

export const SEARCH_TABS = [
  { id: "ALL", label: "All" },
  { id: "ONLINE", label: "Online" },
  { id: "HOME", label: "Home" },
  { id: "ASSIGNMENT", label: "Assignment" },
] as const;

export const MODE_LABELS: Record<TeachingMode, string> = {
  ONLINE: "Online",
  HOME: "At home",
  TRAVEL: "Travel to tutor",
  ASSIGNMENT: "Assignment help",
};

export const WHEN_NEEDED = ["ASAP", "THIS_WEEK", "FLEXIBLE"] as const;
export type WhenNeeded = (typeof WHEN_NEEDED)[number];
export const WHEN_NEEDED_LABELS: Record<WhenNeeded, string> = {
  ASAP: "As soon as possible",
  THIS_WEEK: "This week",
  FLEXIBLE: "I'm flexible",
};

export const JOB_FREQUENCIES = ["ONCE", "WEEKLY", "DAILY"] as const;
export type JobFrequency = (typeof JOB_FREQUENCIES)[number];
export const FREQUENCY_LABELS: Record<JobFrequency, string> = {
  ONCE: "One-time",
  WEEKLY: "Weekly",
  DAILY: "Daily",
};

export const BUDGET_TYPES = ["HOURLY", "MONTHLY", "COURSE", "FREE"] as const;
export type BudgetType = (typeof BUDGET_TYPES)[number];
export const BUDGET_TYPE_LABELS: Record<string, string> = {
  HOURLY: "Per hour",
  MONTHLY: "Per month",
  FIXED: "Fixed price",
  COURSE: "Complete course",
  FREE: "Free",
};

export const RATE_TYPES = ["HOURLY", "MONTHLY", "COURSE", "FREE"] as const;
export type RateType = (typeof RATE_TYPES)[number];
export const RATE_TYPE_LABELS: Record<RateType, string> = {
  HOURLY: "Hourly",
  MONTHLY: "Monthly",
  COURSE: "Complete course",
  FREE: "Free",
};

export const CURRENCIES = ["USD", "INR", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export type TutorSkill = { name: string; level: SkillLevel };

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Urdu",
  "Marathi",
  "Spanish",
  "French",
  "Arabic",
  "Mandarin",
  "German",
  "Portuguese",
  "Japanese",
  "Korean",
  "Italian",
  "Russian",
  "Turkish",
  "Dutch",
  "Indonesian",
  "Vietnamese",
] as const;

export const GENDER_PREFS = ["ANY", "FEMALE", "MALE"] as const;
export type GenderPref = (typeof GENDER_PREFS)[number];
export const GENDER_PREF_LABELS: Record<GenderPref, string> = {
  ANY: "Any tutor",
  FEMALE: "Female tutor",
  MALE: "Male tutor",
};

export const MIN_AGE = 13;

export const TUTOR_GENDERS = ["FEMALE", "MALE", "OTHER", "UNDISCLOSED"] as const;
export type TutorGender = (typeof TUTOR_GENDERS)[number];
export const TUTOR_GENDER_LABELS: Record<TutorGender, string> = {
  FEMALE: "Female",
  MALE: "Male",
  OTHER: "Other",
  UNDISCLOSED: "Prefer not to say",
};

export const TUTOR_WORKS_AS = ["INDIVIDUAL", "AGENCY"] as const;
export type TutorWorksAs = (typeof TUTOR_WORKS_AS)[number];
export const TUTOR_WORKS_AS_LABELS: Record<TutorWorksAs, string> = {
  INDIVIDUAL: "Individual teacher",
  AGENCY: "Tutoring agency",
};

/** Examples only — tutors may add any skill worldwide. */
export const SKILL_SUGGESTIONS = [
  "Academic Writing",
  "Accounting",
  "Arabic",
  "AutoCAD",
  "Biology",
  "Business Management",
  "C++",
  "Chemistry",
  "Chess",
  "Computer Science",
  "Cooking",
  "Data Science",
  "Digital Marketing",
  "Economics",
  "English",
  "Excel",
  "French",
  "German",
  "Guitar",
  "Hindi",
  "IELTS",
  "Java",
  "JavaScript",
  "Law",
  "Mandarin",
  "Mathematics",
  "Music",
  "Photography",
  "Physics",
  "Piano",
  "Public Speaking",
  "Python",
  "React",
  "SAT",
  "Spanish",
  "Statistics",
  "TOEFL",
  "Yoga",
] as const;
