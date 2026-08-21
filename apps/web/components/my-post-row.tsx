"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/client";
import { formatMoney } from "@/lib/money";
import type { JobCard } from "@wtws/shared";

export function MyPostRow({ job }: { job: JobCard }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function close() {
    setError("");
    try {
      await apiClient(`/jobs/${job.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "CLOSED" }) });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not close");
    }
  }

  return (
    <article className="border-b border-[rgb(var(--border))] py-5">
      <Link href={`/jobs/${job.id}`} className="text-base font-semibold text-[rgb(var(--wtws-blue))]">
        {job.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-sm">{job.description}</p>
      <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
        {formatMoney(job.budgetMin, job.currency)}
        {job.budgetMax ? `–${formatMoney(job.budgetMax, job.currency)}` : ""}
        {job.budgetType === "HOURLY" ? "/hour" : ""} · {job.city ?? "Online"} · {job.status}
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
        <Link href={`/jobs/${job.id}`} className="text-[rgb(var(--wtws-blue))]">
          View messages
        </Link>
        {job.status === "OPEN" ? (
          <Link href={`/jobs/${job.id}/edit`} className="text-[rgb(var(--wtws-blue))]">
            Edit
          </Link>
        ) : null}
        {job.status === "OPEN" ? (
          <button type="button" className="text-red-600" onClick={close}>
            Close
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}
