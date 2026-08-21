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
    <div>
      {posted ? <PostedBanner /> : null}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold">My requirements</h1>
          <p className="mt-2 text-[rgb(var(--muted-foreground))]">View messages, edit, or close a post.</p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[rgb(var(--wtws-blue))] px-4 text-sm font-semibold text-white"
        >
          Post your study needs
        </Link>
      </div>
      <div className="mt-8">
        {jobs.map((j) => (
          <MyPostRow key={j.id} job={j} />
        ))}
      </div>
      {jobs.length === 0 ? (
        <p className="mt-8 text-[rgb(var(--muted-foreground))]">No posts yet. Post a requirement so tutors can apply.</p>
      ) : null}
    </div>
  );
}
