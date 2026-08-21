import { Suspense } from "react";
import Link from "next/link";
import { listJobs, getMe } from "@/lib/api";
import { JobCardView } from "@/components/job-card";
import { SearchTabs } from "@/components/search-tabs";
import { SearchBar } from "@/components/search-bar";
import { MatchJobsToggle } from "@/components/match-jobs-toggle";

export const metadata = { title: "Tutor jobs" };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const mode = typeof sp.mode === "string" ? sp.mode : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const city = typeof sp.city === "string" ? sp.city : undefined;
  const matched = typeof sp.matched === "string" ? sp.matched : undefined;
  const level = typeof sp.level === "string" ? sp.level : undefined;
  const me = await getMe().catch(() => null);
  const jobs = await listJobs({ mode, q, city, matched, level }).catch(() => []);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold">Tutor jobs</h1>
          <p className="mt-2 text-[rgb(var(--muted-foreground))]">
            Apply with coins. Price drops to free if few tutors respond.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[rgb(var(--wtws-blue))] px-4 text-sm font-semibold text-white"
        >
          Post a job
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        <SearchBar basePath="/jobs" />
        <Suspense>
          <SearchTabs basePath="/jobs" withLevel />
        </Suspense>
        {me?.roles.includes("TUTOR") ? (
          <Suspense>
            <MatchJobsToggle />
          </Suspense>
        ) : null}
      </div>
      <div className="mt-8">
        {jobs.map((j) => (
          <JobCardView key={j.id} job={j} />
        ))}
      </div>
      {jobs.length === 0 ? (
        <div className="mt-8 space-y-3 text-[rgb(var(--muted-foreground))]">
          <p>No exact matches. Try a broader keyword or city.</p>
          <Link href="/jobs/new" className="inline-flex font-semibold text-[rgb(var(--wtws-blue))]">
            Post a request
          </Link>
        </div>
      ) : null}
    </div>
  );
}
