import Link from "next/link";
import { redirect } from "next/navigation";
import { apiGet, getMe } from "@/lib/api";
import type { JobCard } from "@wtws/shared";
import { MyPostRow } from "@/components/my-post-row";
import { PostedBanner } from "@/components/posted-banner";

export const metadata = { title: "My posts" };

export default async function MyPostsPage({ searchParams }: { searchParams: Promise<{ posted?: string }> }) {
  const me = await getMe();
  if (!me) redirect("/login");
  const jobs = await apiGet<JobCard[]>("/jobs/mine").catch(() => []);
  const { posted } = await searchParams;

  return (
    <div className="space-y-8">
      {posted && <PostedBanner />}
      
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            My Requirements
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">My requirements</h1>
          <p className="mt-2 text-slate-600">
            View messages, edit, or close a post.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] px-6 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
        >
          + Post your study needs
        </Link>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Posted Requirements</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {jobs.length} posts
          </span>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((j) => (
              <MyPostRow key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">No requirements posted yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Post a requirement so tutors can apply and help you with your learning goals.
            </p>
            <Link
              href="/jobs/new"
              className="mt-4 rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
            >
              Post Your First Requirement
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
