import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@wtws/ui";
import {
  BUDGET_TYPE_LABELS,
  FREQUENCY_LABELS,
  GENDER_PREF_LABELS,
  MODE_LABELS,
  WHEN_NEEDED_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  type BudgetType,
  type GenderPref,
  type JobApplicant,
  type JobCard,
  type JobFrequency,
  type WhenNeeded,
  type EmploymentType,
} from "@wtws/shared";
import { apiGet, getJob, getMe } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { timeAgo } from "@/lib/time";
import { ApplyButton } from "@/components/apply-button";
import { JobOwnerPanel } from "@/components/job-owner-panel";

type JobDetail = JobCard & {
  alreadyApplied?: boolean;
  conversationId?: string | null;
  earlyAccessUntil?: string;
  earlyAccessActive?: boolean;
  isOwner?: boolean;
  languages?: string[];
  employmentType?: string;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await getJob(id);
    const title = `${job.subject} Tutor Needed${job.city ? ` in ${job.city}` : ""} — Tutor Job`;
    const description = job.description
      ? job.description.slice(0, 150) + (job.description.length > 150 ? "..." : "")
      : `Looking for a ${job.subject} tutor. Apply on gurumates.`;

    return {
      title,
      description,
      alternates: { canonical: `/jobs/${id}` },
      openGraph: { title, description },
      robots: { index: job.status === "OPEN", follow: true },
    };
  } catch {
    return { title: "Tutor Job" };
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let job: JobDetail;
  try {
    job = await getJob(id);
  } catch {
    notFound();
  }
  const me = await getMe().catch(() => null);
  const applicants =
    job.isOwner && me ? await apiGet<JobApplicant[]>(`/jobs/${job.id}/applicants`).catch(() => []) : [];

  const subjects = job.subject.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Button */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to Job Postings
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        {/* Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <span key={s} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {s}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              job.status === "OPEN" 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-slate-100 text-slate-600"
            }`}>
              Status: {job.status}
            </span>
            <span className="text-xs text-slate-500">
              Posted {timeAgo(job.createdAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{job.title}</h1>
        
        {/* Posted By */}
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Posted by <span className="font-medium">{job.studentName}</span>
          {job.city && (
            <>
              <span className="text-slate-300">•</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {job.city}{job.country ? `, ${job.country}` : ""}
            </>
          )}
        </p>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-medium uppercase text-slate-500">Budget Range</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatMoney(job.budgetMin, job.currency)}
              {job.budgetMax ? `–${formatMoney(job.budgetMax, job.currency)}` : ""}
              <span className="text-xs font-normal text-slate-500"> /{BUDGET_TYPE_LABELS[job.budgetType as BudgetType]?.toLowerCase().replace("per ", "") || "hr"}</span>
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-medium uppercase text-slate-500">Class Mode</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {job.modes.map((m) => MODE_LABELS[m]).join(", ")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-medium uppercase text-slate-500">Experience Level</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{job.level || "Any"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-medium uppercase text-slate-500">Schedule</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {FREQUENCY_LABELS[job.frequency as JobFrequency] ?? job.frequency}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{WHEN_NEEDED_LABELS[job.whenNeeded as WhenNeeded] ?? job.whenNeeded}</Badge>
          {job.genderPref !== "ANY" && (
            <Badge>{GENDER_PREF_LABELS[job.genderPref as GenderPref]}</Badge>
          )}
          {job.employmentType && (
            <Badge>{EMPLOYMENT_TYPE_LABELS[job.employmentType as EmploymentType] ?? job.employmentType}</Badge>
          )}
        </div>
      </div>

      {/* Detailed Requirement */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Detailed Requirement Overview</h2>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
            Structured Format
          </button>
        </div>
        
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {job.description}
        </div>

        {job.hiddenContact && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase text-emerald-700">Contact shared by student</p>
            <p className="mt-1 break-words text-sm text-emerald-900">{job.hiddenContact}</p>
          </div>
        )}

        {/* Languages */}
        {job.languages && job.languages.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Communication Languages</p>
                <p className="mt-1 text-sm text-slate-600">{job.languages.join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Info Grid */}
        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Primary Focus Areas</p>
              <p className="mt-1 text-sm text-slate-600">{subjects.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Availability Needed</p>
              <p className="mt-1 text-sm text-slate-600">
                {WHEN_NEEDED_LABELS[job.whenNeeded as WhenNeeded] ?? job.whenNeeded}, {FREQUENCY_LABELS[job.frequency as JobFrequency] ?? job.frequency} sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Section or Owner Panel */}
      {job.isOwner ? (
        <JobOwnerPanel jobId={job.id} status={job.status} applicants={applicants} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-slate-900">Apply to this requirement</p>
              <p className="mt-1 text-sm text-slate-600">
                {job.coinPrice === 0 
                  ? "Free to apply — start a conversation with the student" 
                  : `Spend ${job.coinPrice} coins to unlock chat. Phone and WhatsApp unlock after the student pays.`}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {job.applyCount} tutor{job.applyCount !== 1 ? "s" : ""} already applied
              </p>
            </div>
          </div>
          
          {job.status !== "OPEN" ? (
            <div className="mt-4 rounded-lg bg-slate-100 p-3 text-center text-sm text-slate-600">
              This post is {job.status.toLowerCase()}.
            </div>
          ) : me ? (
            <div className="mt-4">
              <ApplyButton
                jobId={job.id}
                coinPrice={job.coinPrice}
                alreadyApplied={Boolean(job.alreadyApplied)}
                conversationId={job.conversationId ?? null}
                earlyAccessActive={Boolean(job.earlyAccessActive)}
                earlyAccessUntil={job.earlyAccessUntil}
              />
            </div>
          ) : (
            <div className="mt-4">
              <Link
                href={`/login?next=${encodeURIComponent(`/jobs/${job.id}`)}`}
                className="block rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
              >
                Log in as a tutor to apply
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
