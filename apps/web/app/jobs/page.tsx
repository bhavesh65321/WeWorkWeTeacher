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
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Tutor Jobs
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Browse tutor jobs</h1>
          <p className="mt-2 text-slate-600">
            Apply with coins. Price drops to free if few tutors respond.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] px-6 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
        >
          + Post a job
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <SearchBar basePath="/jobs" />
          <Suspense>
            <SearchTabs basePath="/jobs" withLevel />
          </Suspense>
          {me?.roles.includes("TUTOR") && (
            <Suspense>
              <MatchJobsToggle />
            </Suspense>
          )}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Available Jobs</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {jobs.length} found
            </span>
          </div>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((j) => (
              <JobCardView key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">No exact matches</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Try a broader keyword or city, or post your own requirement.
            </p>
            <Link
              href="/jobs/new"
              className="mt-4 rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
            >
              Post a Request
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
