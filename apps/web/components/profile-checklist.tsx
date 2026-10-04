"use client";

import { useMemo } from "react";
import type { TutorCard } from "@wtws/shared";

interface ChecklistItem {
  key: string;
  label: string;
  complete: boolean;
  required: boolean;
}

export function ProfileChecklist({ profile }: { profile: TutorCard }) {
  const items: ChecklistItem[] = useMemo(() => {
    const headline = profile.headline?.trim() || "";
    const bio = profile.bio?.trim() || "";

    return [
      {
        key: "photo",
        label: "Profile photo",
        complete: !!profile.photoUrl,
        required: true,
      },
      {
        key: "headline",
        label: "Headline",
        complete: headline.length >= 8,
        required: true,
      },
      {
        key: "bio",
        label: "Bio",
        complete: bio.length >= 20,
        required: true,
      },
      {
        key: "modes",
        label: "Teaching modes",
        complete: (profile.modes?.length ?? 0) > 0,
        required: true,
      },
      {
        key: "skills",
        label: "Skills or subjects",
        complete: (profile.skills?.length ?? profile.subjects?.length ?? 0) > 0,
        required: true,
      },
      {
        key: "rate",
        label: "Hourly rate",
        complete: profile.rateType === "FREE" || (profile.hourlyRateMinor ?? 0) > 0,
        required: true,
      },
      {
        key: "currency",
        label: "Currency",
        complete: !!profile.currency,
        required: true,
      },
      {
        key: "languages",
        label: "Languages",
        complete: (profile.languages?.length ?? 0) > 0,
        required: true,
      },
      {
        key: "city",
        label: "City",
        complete: !!profile.city?.trim(),
        required: true,
      },
    ];
  }, [profile]);

  const completed = items.filter((item) => item.complete).length;
  const total = items.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="space-y-4 rounded-lg border border-[rgb(var(--border))] p-4">
      <div>
        <h3 className="text-lg font-semibold">Profile Checklist</h3>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          {completed} of {total} complete ({percentage}%)
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-[rgb(var(--muted))]">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-3">
            <div
              className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                item.complete
                  ? "border-green-500 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              {item.complete && (
                <span className="text-sm font-bold text-green-600">✓</span>
              )}
              {!item.complete && (
                <span className="text-sm font-bold text-red-400">✗</span>
              )}
            </div>
            <span
              className={`text-sm ${
                item.complete
                  ? "text-[rgb(var(--foreground))]"
                  : "text-[rgb(var(--muted-foreground))]"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Status message */}
      {completed === total ? (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          ✓ Your profile is complete and ready to publish!
        </div>
      ) : (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          Complete {total - completed} more field{total - completed !== 1 ? "s" : ""} to publish your profile.
        </div>
      )}
    </div>
  );
}
