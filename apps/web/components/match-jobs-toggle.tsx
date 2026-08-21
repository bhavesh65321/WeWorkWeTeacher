"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function MatchJobsToggle() {
  const params = useSearchParams();
  const router = useRouter();
  const on = params.get("matched") === "1";

  function toggle() {
    const next = new URLSearchParams(params.toString());
    if (on) next.delete("matched");
    else next.set("matched", "1");
    const qs = next.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={on} onChange={toggle} className="h-4 w-4 accent-[rgb(var(--wtws-blue))]" />
      Jobs matching my skills
    </label>
  );
}
