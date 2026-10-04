"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/client";
import { formatMoney } from "@/lib/money";
import { timeAgo } from "@/lib/time";
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/jobs/${job.id}`} className="font-semibold text-slate-900 hover:text-[rgb(var(--wtws-blue))]">
              {job.title}
            </Link>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              job.status === "OPEN" 
                ? "bg-emerald-100 text-emerald-700" 
                : job.status === "CLOSED" 
                  ? "bg-red-100 text-red-700" 
                  : "bg-amber-100 text-amber-700"
            }`}>
              {job.status}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{job.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-slate-900">
            {formatMoney(job.budgetMin, job.currency)}
            {job.budgetMax ? `–${formatMoney(job.budgetMax, job.currency)}` : ""}
          </p>
          <p className="text-xs text-slate-500">
            {job.budgetType === "HOURLY" ? "/hour" : "total"}
          </p>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeAgo(job.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.city ?? "Online"}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {job.applyCount} applied
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link 
          href={`/jobs/${job.id}`} 
          className="rounded-xl bg-[rgb(var(--wtws-blue))] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
        >
          View Messages
        </Link>
        {job.status === "OPEN" && (
          <>
            <Link 
              href={`/jobs/${job.id}/edit`} 
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Edit
            </Link>
            <button 
              type="button" 
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              onClick={close}
            >
              Close
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </article>
  );
}
