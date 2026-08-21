"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/client";

export function GoogleButton({
  label = "Continue with Google",
  next,
}: {
  label?: string;
  next?: string | null;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    apiClient<{ google: boolean }>("/auth/methods")
      .then((m) => setEnabled(m.google))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Link
        href={next ? `/auth/google?next=${encodeURIComponent(next)}` : "/auth/google"}
        className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-white text-sm font-semibold hover:bg-[rgb(var(--muted))]"
      >
        {label}
      </Link>
      <p className="mt-6 text-center text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
        or
      </p>
    </>
  );
}
