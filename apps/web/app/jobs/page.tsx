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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-block rounded-lg bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 sm:px-3 sm:py-1 sm:text-xs">
            Tutor Jobs
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">Browse tutor jobs</h1>
          <p className="mt-1 text-sm text-slate-600 sm:mt-2 sm:text-base">
            Apply with coins. Price drops to free if few tutors respond.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[rgb(var(--wtws-blue))] px-4 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))] sm:min-h-11 sm:rounded-xl sm:px-6"
        >
          + Post a job
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
        <div className="space-y-3 sm:space-y-4">
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Available Jobs</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:px-3 sm:py-1 sm:text-xs">
              {jobs.length} found
            </span>
          </div>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {jobs.map((j) => (
              <JobCardView key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center sm:rounded-2xl sm:px-6 sm:py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 sm:mb-4 sm:h-14 sm:w-14">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">No exact matches</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">
              Try a broader keyword or city, or post your own requirement.
            </p>
            <Link
              href="/jobs/new"
              className="mt-3 rounded-lg bg-[rgb(var(--wtws-blue))] px-4 py-2 text-xs font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))] sm:mt-4 sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm"
            >
              Post a Request
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
