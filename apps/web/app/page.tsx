import type { Metadata } from "next";
import Link from "next/link";
import { listTutors, listJobs, getMe, getMeta } from "@/lib/api";
import { HomeHeroSearch } from "@/components/home-hero-search";
import { HomeFeatured } from "@/components/home-featured";
import { HomeSkills } from "@/components/home-skills";

export const metadata: Metadata = {
  title: "gurumates — Find Trusted Tutors Near You | Online & Home Tuition",
  description:
    "Find verified tutors for any subject — academics, coding, music, languages & more. Post your requirement free, chat safely, unlock contact when ready. Join 1000+ students & tutors.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [tutors, jobs, me, meta] = await Promise.all([
    listTutors({}).catch(() => []),
    listJobs({}).catch(() => []),
    getMe().catch(() => null),
    getMeta().catch(() => ({ subjects: [] as string[] })),
  ]);
  const signedIn = Boolean(me);

  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-[rgb(var(--wtws-blue))] px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-400/20" />
        <div className="relative z-10 mx-auto max-w-2xl space-y-5 text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Find trusted tutors. Pay only after you connect.
          </h1>
          <p className="text-base leading-relaxed text-blue-100 sm:text-lg">
            Post what you need or search tutors by subject. Chat first, unlock contact with coins when ready.
          </p>
          <div className="mx-auto max-w-xl">
            <HomeHeroSearch />
          </div>
          {signedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center rounded-xl bg-white px-6 text-base font-bold text-[rgb(var(--wtws-blue))] shadow-sm hover:bg-slate-50"
            >
              Go to dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/jobs/new"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-base font-bold text-[rgb(var(--wtws-blue))] shadow-sm hover:bg-slate-50"
              >
                Post a requirement
              </Link>
              <Link
                href="/tutors"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 text-base font-semibold text-white hover:bg-white/20"
              >
                Find tutors
              </Link>
            </div>
          )}
        </div>
      </section>

      <HomeFeatured tutors={tutors} jobs={jobs} signedIn={signedIn} />

      <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <TrustCard
          number="1"
          title="Post or search free"
          body="Students post requirements for free. Tutors browse jobs matching their skills."
        />
        <TrustCard
          number="2"
          title="Chat in gurumates"
          body="Phone, email, and WhatsApp stay hidden. Build trust in chat first."
        />
        <TrustCard
          number="3"
          title="Unlock when ready"
          body="Spend coins to unlock contact. Pay for lessons directly with the tutor you trust."
        />
      </section>

      {!signedIn && (
        <section className="relative overflow-hidden rounded-3xl bg-[rgb(var(--wtws-blue-dark))] p-8 text-white sm:p-10">
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Teach on gurumates
              </h2>
              <p className="text-sm leading-relaxed text-blue-100 sm:text-base">
                Get matched to students by skill. Apply with coins. Keep 100% of what you earn after unlock.
              </p>
            </div>
            <Link
              href="/register?as=tutor"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[rgb(var(--wtws-blue))] hover:bg-slate-100 sm:text-base"
            >
              Join as a tutor
            </Link>
          </div>
        </section>
      )}

      <HomeSkills live={meta.subjects} />
    </div>
  );
}

function TrustCard({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-[rgb(var(--wtws-blue))]">
        {number}
      </div>
      <h3 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
