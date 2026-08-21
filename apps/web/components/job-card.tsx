import { Badge } from "@wtws/ui";
import { MODE_LABELS, type JobCard } from "@wtws/shared";
import { formatMoney } from "@/lib/money";
import { timeAgo } from "@/lib/time";
import Link from "next/link";

export function JobCardView({ job }: { job: JobCard }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block border-b border-[rgb(var(--border))] py-5 first:pt-0">
      <h3 className="text-base font-semibold text-[rgb(var(--wtws-blue))]">{job.title}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge>{job.subject}</Badge>
        {job.modes.map((m) => (
          <Badge key={m}>{MODE_LABELS[m]}</Badge>
        ))}
        {job.level ? <Badge>{job.level}</Badge> : null}
        {job.status !== "OPEN" ? <Badge>{job.status}</Badge> : null}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-[rgb(var(--foreground))]">{job.description}</p>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        {timeAgo(job.createdAt)} · {job.coinPrice === 0 ? "Free to apply" : `${job.coinPrice} coins`} ·{" "}
        {job.city ?? "Online"} · {formatMoney(job.budgetMin, job.currency)}
        {job.budgetMax ? `–${formatMoney(job.budgetMax, job.currency)}` : ""}
        {job.budgetType === "HOURLY" ? "/hour" : ""} · {job.applyCount} applied
      </p>
    </Link>
  );
}
