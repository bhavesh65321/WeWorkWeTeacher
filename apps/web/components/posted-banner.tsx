"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostedBanner() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      <p>Your requirement has been posted. We will notify you when a tutor applies.</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setOpen(false);
          router.replace("/jobs/mine");
        }}
      >
        ×
      </button>
    </div>
  );
}
