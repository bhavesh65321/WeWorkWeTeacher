import type { JobStatus, JobType, JobVisibility, Role, TeachingMode, TutorSkill } from "./constants";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  activeRole: Role;
  coinBalance?: number;
  isPremium?: boolean;
  isAdmin?: boolean;
  referralCode?: string | null;
};

export type TutorReview = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  fromName: string;
};

export type TutorCard = {
  id: string;
  userId: string;
  slug: string;
  name: string;
  headline: string | null;
  bio: string | null;
  hourlyRateMinor: number | null;
  hourlyRateMaxMinor?: number | null;
  currency: string;
  timezone: string;
  city: string | null;
  country: string | null;
  subjects: string[];
  skills?: TutorSkill[];
  photoUrl?: string | null;
  rateType?: string;
  modes: TeachingMode[];
  levels: string[];
  languages: string[];
  teachingApproach?: string | null;
  experience?: string | null;
  education?: string | null;
  freeTrialMinutes?: number;
  yearsTeaching?: number | null;
  yearsOnline?: number | null;
  gender?: string | null;
  worksAs?: string;
  registeredAt?: string;
  lastSeenAt?: string | null;
  ratingAvg: number;
  reviewCount: number;
  isPremium?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  reviews?: TutorReview[];
};

export type JobCard = {
  id: string;
  title: string;
  description: string;
  type: JobType;
  modes: TeachingMode[];
  visibility: JobVisibility;
  subject: string;
  level: string | null;
  city: string | null;
  country: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  whenNeeded: string;
  frequency: string;
  budgetType: string;
  genderPref: string;
  status: JobStatus;
  createdAt: string;
  studentName: string;
  coinPrice: number;
  applyCount: number;
  earlyAccessUntil?: string;
};

export type JobApplicant = {
  tutorName: string;
  tutorSlug: string | null;
  conversationId: string;
  createdAt: string;
};

export type { JobStatus, JobType, JobVisibility, Role, TeachingMode, TutorSkill };
export * from "./constants";
