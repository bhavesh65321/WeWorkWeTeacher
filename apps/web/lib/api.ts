import { cookies } from "next/headers";
import type { JobCard, PublicUser, TutorCard } from "@wtws/shared";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function serverHeaders() {
  const jar = await cookies();
  const token = jar.get("wtws_token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Cookie: `wtws_token=${token}` } : {}),
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}/api${path}`, {
    headers: await serverHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGetOptional<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API}/api${path}`, {
    headers: await serverHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export type Me = PublicUser & {
  tutorSlug: string | null;
  coinBalance: number;
  isPremium: boolean;
  isAdmin: boolean;
  referralCode: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  onboardingComplete: boolean;
  tutorOnboardingComplete: boolean;
  unreadCount?: number;
  defaultVisibility?: string;
  tutorPublished?: boolean | null;
  notifyMatching?: boolean | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  hasGoogle?: boolean;
  hasPassword?: boolean;
};

export function listTutors(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const qs = q.toString();
  return apiGet<TutorCard[]>(`/tutors${qs ? `?${qs}` : ""}`);
}

export function getTutor(slug: string) {
  return apiGet<TutorCard>(`/tutors/${slug}`);
}

export function listJobs(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const qs = q.toString();
  return apiGet<JobCard[]>(`/jobs${qs ? `?${qs}` : ""}`);
}

export function getJob(id: string) {
  return apiGet<JobCard>(`/jobs/${id}`);
}

export function getMe() {
  return apiGetOptional<Me>("/auth/me");
}

export function getMeta() {
  return apiGet<{ subjects: string[]; cities: string[] }>("/tutors/meta");
}
