"use client";

import Link from "next/link";
import type { TutorCard } from "@wtws/shared";

export function ProfileActionCard({ profile }: { profile: TutorCard | null }) {
  if (!profile) return null;

  const headline = profile.headline?.trim() || "";
  const bio = profile.bio?.trim() || "";

  const checks = [
    !!profile.photoUrl,
    headline.length >= 8,
    bio.length >= 20,
    (profile.modes?.length ?? 0) > 0,
    (profile.skills?.length ?? profile.subjects?.length ?? 0) > 0,
    profile.rateType === "FREE" || (profile.hourlyRateMinor ?? 0) > 0,
    !!profile.currency,
    (profile.languages?.length ?? 0) > 0,
    !!profile.city?.trim(),
  ];

  const completed = checks.filter(Boolean).length;
  const total = checks.length;

  // Only show if profile is incomplete
  if (completed === total) return null;

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Complete your profile</h3>
          <p className="mt-1 text-sm text-blue-700">
            {total - completed} field{total - completed !== 1 ? "s" : ""} needed to publish and appear in search
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-blue-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.round((completed / total) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-blue-600">
            {completed}/{total} complete
          </p>
        </div>
        <Link
          href="/tutors/edit"
          className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Complete
        </Link>
      </div>
    </div>
  );
}
