"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@wtws/ui";

export function SearchBar({
  basePath = "/tutors",
  variant = "page",
}: {
  basePath?: string;
  variant?: "page" | "hero";
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const hero = variant === "hero";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    if (city) next.set("city", city);
    else next.delete("city");
    router.push(`${basePath}?${next.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={hero ? "flex flex-col gap-2 sm:flex-row sm:items-stretch" : "flex flex-col gap-2 sm:flex-row"}
    >
      <Input
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={hero || basePath !== "/jobs" ? "Subject / skill" : "Subject or job title"}
        aria-label="Subject or skill"
        className={hero ? "min-h-12 rounded-xl bg-white text-base sm:text-sm" : ""}
      />
      <Input
        name="city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={hero ? "Location" : "City (optional)"}
        aria-label="City"
        className={hero ? "min-h-12 rounded-xl bg-white text-base sm:flex-1 sm:text-sm" : "sm:max-w-xs"}
      />
      <button
        type="submit"
        className={
          hero
            ? "inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] px-6 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
            : "min-h-11 rounded-lg bg-[rgb(var(--wtws-blue))] px-6 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
        }
      >
        Search
      </button>
    </form>
  );
}
