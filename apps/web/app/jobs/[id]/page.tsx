import { notFound } from "next/navigation";
import { Badge } from "@wtws/ui";
import {
  BUDGET_TYPE_LABELS,
  FREQUENCY_LABELS,
  GENDER_PREF_LABELS,
  MODE_LABELS,
  WHEN_NEEDED_LABELS,
  type BudgetType,
  type GenderPref,
  type JobApplicant,
  type JobCard,
  type JobFrequency,
  type WhenNeeded,
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
};

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

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-[rgb(var(--wtws-teal))]">{job.subject}</p>
      <h1 className="mt-1 text-3xl font-bold">{job.title}</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        Posted by {job.studentName} · {timeAgo(job.createdAt)}
        {job.status !== "OPEN" ? ` · ${job.status}` : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.modes.map((m) => (
          <Badge key={m}>{MODE_LABELS[m]}</Badge>
        ))}
        {job.level ? <Badge>{job.level}</Badge> : null}
        <Badge>{WHEN_NEEDED_LABELS[job.whenNeeded as WhenNeeded] ?? job.whenNeeded}</Badge>
        <Badge>{FREQUENCY_LABELS[job.frequency as JobFrequency] ?? job.frequency}</Badge>
        {job.genderPref !== "ANY" ? (
          <Badge>{GENDER_PREF_LABELS[job.genderPref as GenderPref]}</Badge>
        ) : null}
      </div>
      <p className="mt-6 whitespace-pre-wrap">{job.description}</p>
      <p className="mt-4 text-[rgb(var(--muted-foreground))]">
        {job.city ?? "Online"} · {BUDGET_TYPE_LABELS[job.budgetType as BudgetType] ?? job.budgetType}{" "}
        {formatMoney(job.budgetMin, job.currency)}
        {job.budgetMax ? `–${formatMoney(job.budgetMax, job.currency)}` : ""} ·{" "}
        {job.coinPrice === 0 ? "Free to apply" : `${job.coinPrice} coins to apply`} · {job.applyCount} applied
      </p>
      {job.isOwner ? (
        <JobOwnerPanel jobId={job.id} status={job.status} applicants={applicants} />
      ) : (
        <div className="mt-8 rounded-2xl bg-[rgb(var(--muted))] p-5">
          <p className="font-semibold">Apply in-app</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
            Unlock starts a WTWS chat. Phone and WhatsApp unlock after the student pays.
          </p>
          {job.status !== "OPEN" ? (
            <p className="mt-3 text-sm">This post is {job.status.toLowerCase()}.</p>
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
            <p className="mt-3 text-sm">Log in as a tutor to apply.</p>
          )}
        </div>
      )}
    </div>
  );
}
