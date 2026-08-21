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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Manage reviews</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        Reviews are tied to paid sessions. Students leave them after releasing escrow.
      </p>
      <section className="mt-8">
        <h2 className="text-lg font-bold">Reviews you received</h2>
        {data.received.length === 0 ? (
          <p className="mt-3 rounded-xl bg-[rgb(var(--muted))] px-4 py-3 text-sm">You have not received any reviews yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[rgb(var(--border))]">
            {data.received.map((r) => (
              <li key={r.id} className="py-4">
                <p className="text-sm font-semibold">
                  {r.rating}/5 · {r.name} · {timeAgo(r.createdAt)}
                </p>
                {r.body ? <p className="mt-1 text-sm">{r.body}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-bold">Reviews you gave</h2>
        {data.given.length === 0 ? (
          <p className="mt-3 rounded-xl bg-[rgb(var(--muted))] px-4 py-3 text-sm">You have not given any reviews yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[rgb(var(--border))]">
            {data.given.map((r) => (
              <li key={r.id} className="py-4">
                <p className="text-sm font-semibold">
                  {r.rating}/5 · {r.name} · {timeAgo(r.createdAt)}
                </p>
                {r.body ? <p className="mt-1 text-sm">{r.body}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-8 text-sm">
        <Link href="/inbox" className="font-semibold text-[rgb(var(--wtws-blue))]">
          Open messages
        </Link>
        {" · "}
        <Link href="/jobs" className="font-semibold text-[rgb(var(--wtws-blue))]">
          Tutor jobs
        </Link>
      </p>
    </div>
  );
}
