import Link from "next/link";
import { Card } from "@wtws/ui";
import { JobCardView } from "@/components/job-card";
import type { JobCard } from "@wtws/shared";

export function StudentDashboard({
  name,
  coins,
  phone,
  jobs,
}: {
  name: string;
  coins: number;
  phone: string | null;
  jobs: JobCard[];
}) {
  const action = [];
  if (!phone) {
    action.push({ href: "/settings", title: "Add phone", body: "Tutors see this only after you pay." });
  }
  if (jobs.length === 0) {
    action.push({ href: "/jobs/new", title: "Post a requirement", body: "Tell tutors the subject, city, and budget." });
  }

  return (
    <div>
      <Link
        href="/jobs/new"
        className="inline-flex min-h-11 items-center rounded-xl bg-[rgb(var(--wtws-blue))] px-4 text-sm font-semibold text-white"
      >
        + Post requirement
      </Link>
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h1 className="text-3xl font-bold">Student dashboard</h1>
        <Link href="/wallet" className="rounded-2xl border border-[rgb(var(--wtws-blue))] px-4 py-3 text-sm">
          <p className="font-semibold">{coins} coins</p>
          <p className="text-[rgb(var(--muted-foreground))]">Your wallet balance</p>
        </Link>
      </div>
      <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Hi {name}. Post a need, wait for applies, then pay in WTWS.</p>

      {action.length ? (
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Action needed</h2>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Urgent</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {action.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="h-full border-red-200">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{item.body}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {phone ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold">Completed</h2>
          <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
            Phone added
          </p>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">My requirements</h2>
          <Link href="/jobs/mine" className="text-sm font-semibold text-[rgb(var(--wtws-blue))]">
            See all
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">No posts yet.</p>
        ) : (
          <div className="mt-2">
            {jobs.slice(0, 5).map((j) => (
              <JobCardView key={j.id} job={j} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
