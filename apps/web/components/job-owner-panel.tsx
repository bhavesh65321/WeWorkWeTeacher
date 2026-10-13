"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import type { JobApplicant } from "@wtws/shared";
import { timeAgo } from "@/lib/time";

export function JobOwnerPanel({
  jobId,
  status,
  applicants,
}: {
  jobId: string;
  status: string;
  applicants: JobApplicant[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function setStatus(next: "OPEN" | "CLOSED" | "FILLED") {
    setError("");
    try {
      await apiClient(`/jobs/${jobId}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900">Requirement Control & Applicants</h2>
          <p className="text-sm text-slate-500">Manage post settings and review applicant proposals in one place</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {applicants.length}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/jobs/${jobId}/edit`}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Post
        </Link>
        {status !== "OPEN" ? (
          <Button type="button" variant="secondary" onClick={() => setStatus("OPEN")}>
            Reopen
          </Button>
        ) : (
          <button
            type="button"
            onClick={() => setStatus("CLOSED")}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        )}
        {status !== "FILLED" && (
          <button
            type="button"
            onClick={() => setStatus("FILLED")}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark Filled
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* Applicants Section */}
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
        {applicants.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">No Applications Received Yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tutors matching your requirements are notified. Applications appear here directly.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              + Simulate Incoming Tutor Application
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">
              {applicants.length} Tutor{applicants.length !== 1 ? "s" : ""} Applied
            </h3>
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {applicants.map((a) => (
                <li key={a.conversationId} className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
                      {a.tutorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      {a.tutorSlug ? (
                        <Link href={`/tutors/${a.tutorSlug}`} className="font-semibold text-slate-900 hover:text-blue-600">
                          {a.tutorName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-900">{a.tutorName}</span>
                      )}
                      <p className="text-xs text-slate-500">Applied {timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                  <Link
                    href={`/inbox/${a.conversationId}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    View & Chat
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
