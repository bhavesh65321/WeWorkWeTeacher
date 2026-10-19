import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { listTutors } from "@/lib/api";
import { TutorCardView } from "@/components/tutor-card";
import { SearchBar } from "@/components/search-bar";
import { SearchTabs } from "@/components/search-tabs";

export const metadata: Metadata = {
  title: "Find Tutors — Online & Home Tuition for Any Subject",
  description:
    "Browse verified tutors for academics, coding, music, languages & more. Filter by subject, city, or teaching mode. Message tutors safely on gurumates.",
  alternates: { canonical: "/tutors" },
  openGraph: {
    title: "Find Tutors — Online & Home Tuition",
    description: "Browse verified tutors for any subject. Filter by city or teaching mode.",
  },
};

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const mode = typeof sp.mode === "string" ? sp.mode : undefined;
  const city = typeof sp.city === "string" ? sp.city : undefined;
  const subject = typeof sp.subject === "string" ? sp.subject : undefined;
  const tutors = await listTutors({ q, mode, city, subject }).catch(() => []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Find Tutors
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Find tutors</h1>
          <p className="mt-2 text-slate-600">
            Search any subject or skill — academics, languages, coding, music, and more.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] px-6 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
        >
          + Post a requirement
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <SearchBar />
          <Suspense>
            <SearchTabs basePath="/tutors" />
          </Suspense>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Available Tutors</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {tutors.length} found
            </span>
          </div>
        </div>

        {tutors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((t) => (
              <TutorCardView key={t.id} tutor={t} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">No exact matches</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Try a broader subject or city, or post a requirement and let tutors come to you.
            </p>
            <Link
              href="/jobs/new"
              className="mt-4 rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
            >
              Post a Requirement
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
