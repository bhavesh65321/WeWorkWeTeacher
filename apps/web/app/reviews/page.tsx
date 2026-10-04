import { redirect } from "next/navigation";
import Link from "next/link";
import { apiGet, getMe } from "@/lib/api";
import { timeAgo } from "@/lib/time";

export const metadata = { title: "Reviews" };

type Item = { id: string; rating: number; body: string | null; createdAt: string; name: string };

export default async function ReviewsPage() {
  const me = await getMe();
  if (!me) redirect("/login");
  const data = await apiGet<{ given: Item[]; received: Item[] }>("/bookings/reviews").catch(() => ({
    given: [] as Item[],
    received: [] as Item[],
  }));

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Reviews
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Manage reviews</h1>
        <p className="mt-2 text-slate-600">
          Reviews are tied to paid sessions. Students leave them after releasing escrow.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Reviews you received</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {data.received.length} reviews
          </span>
        </div>

        {data.received.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">No reviews yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Complete sessions and ask students to leave reviews after releasing escrow.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {data.received.map((r) => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500">{timeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                  {renderStars(r.rating)}
                </div>
                {r.body && <p className="mt-3 text-sm text-slate-600">{r.body}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Reviews you gave</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {data.given.length} reviews
          </span>
        </div>

        {data.given.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">No reviews given</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              After completing a session, leave a review for your tutor.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {data.given.map((r) => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500">{timeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                  {renderStars(r.rating)}
                </div>
                {r.body && <p className="mt-3 text-sm text-slate-600">{r.body}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          href="/inbox"
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Open Messages
        </Link>
        <Link
          href="/jobs"
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}
