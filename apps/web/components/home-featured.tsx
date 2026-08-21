"use client";

import { useState } from "react";
import Link from "next/link";
import { MODE_LABELS, type JobCard, type TutorCard } from "@wtws/shared";
import { formatMoney, formatTutorFee } from "@/lib/money";
import { TutorAvatar } from "@/components/tutor-avatar";
import { timeAgo } from "@/lib/time";

export function HomeFeatured({
  tutors,
  jobs,
  signedIn,
}: {
  tutors: TutorCard[];
  jobs: JobCard[];
  signedIn: boolean;
}) {
  const [tab, setTab] = useState<"tutors" | "jobs">("tutors");

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Featured profiles</h2>
          <p className="mt-0.5 text-sm text-slate-500">Published tutors and open jobs. Chat stays in WTWS until you pay.</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setTab("tutors")}
            className={`rounded-lg px-4 py-2 ${tab === "tutors" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
          >
            Tutors
          </button>
          <button
            type="button"
            onClick={() => setTab("jobs")}
            className={`rounded-lg px-4 py-2 ${tab === "jobs" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
          >
            Open Jobs
          </button>
        </div>
      </div>

      {tab === "tutors" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.slice(0, 6).map((tutor) => (
            <article
              key={tutor.id}
              className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <TutorAvatar name={tutor.name} photoUrl={tutor.photoUrl} className="h-12 w-12 rounded-full text-sm" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{tutor.name}</h3>
                      <p className="text-xs font-medium text-slate-500">
                        {tutor.headline ?? tutor.subjects[0] ?? "Tutor"}
                        {tutor.yearsTeaching ? ` · ${tutor.yearsTeaching} yrs` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {formatTutorFee(tutor.rateType, tutor.hourlyRateMinor, tutor.hourlyRateMaxMinor, tutor.currency)}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {tutor.bio ?? tutor.teachingApproach ?? "Published teaching profile on WTWS."}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.modes.slice(0, 2).map((m) => (
                    <span key={m} className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {MODE_LABELS[m]}
                    </span>
                  ))}
                  {tutor.subjects.slice(0, 2).map((s) => (
                    <span key={s} className="rounded bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-200/60 pt-2">
                <Link
                  href={`/tutors/${tutor.slug}`}
                  className="flex min-h-9 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-xs font-semibold hover:border-[rgb(var(--wtws-blue))] hover:text-[rgb(var(--wtws-blue))]"
                >
                  View profile
                </Link>
                <Link
                  href={signedIn ? `/tutors/${tutor.slug}` : `/login?next=/tutors/${tutor.slug}`}
                  className="flex min-h-9 w-full items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] text-xs font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
                >
                  {signedIn ? "Message" : "Sign up to chat"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.slice(0, 6).map((job) => (
            <article key={job.id} className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                  {job.modes[0] ? MODE_LABELS[job.modes[0]] : job.subject}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {job.budgetType === "FREE"
                    ? "Free"
                    : `${formatMoney(job.budgetMin, job.currency)}${job.budgetMax ? `–${formatMoney(job.budgetMax, job.currency)}` : ""}`}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {timeAgo(job.createdAt)} · {job.city ?? "Online"}
                </p>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{job.description}</p>
              <Link
                href={signedIn ? `/jobs/${job.id}` : `/login?next=/jobs/${job.id}`}
                className="flex min-h-9 w-full items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] text-xs font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
              >
                {signedIn ? "View job" : "Sign up to apply"}
              </Link>
            </article>
          ))}
        </div>
      )}

      {tab === "tutors" && tutors.length === 0 ? (
        <p className="text-sm text-slate-500">No published tutors yet.</p>
      ) : null}
      {tab === "jobs" && jobs.length === 0 ? (
        <p className="text-sm text-slate-500">No open jobs yet. Post the first requirement.</p>
      ) : null}
    </section>
  );
}
