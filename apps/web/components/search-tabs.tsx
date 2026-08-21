"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LEVELS, SEARCH_TABS } from "@wtws/shared";

export function SearchTabs({ basePath, withLevel = false }: { basePath: string; withLevel?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const current = params.get("mode") ?? "ALL";
  const level = params.get("level") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "ALL") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {SEARCH_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setParam("mode", tab.id)}
          className={`border-b-2 pb-1 text-sm ${
            current === tab.id
              ? "border-[rgb(var(--wtws-blue))] font-semibold text-[rgb(var(--wtws-blue))]"
              : "border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
          }`}
        >
          {tab.label}
        </button>
      ))}
      {withLevel ? (
        <select
          className="min-h-9 rounded-lg border border-[rgb(var(--border))] bg-white px-2 text-sm"
          value={level}
          onChange={(e) => setParam("level", e.target.value)}
          aria-label="Level"
        >
          <option value="">Level</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
