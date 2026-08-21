import Link from "next/link";
import { listTutors, listJobs, getMe, getMeta } from "@/lib/api";
import { HomeHeroSearch } from "@/components/home-hero-search";
import { HomeFeatured } from "@/components/home-featured";
import { HomeSkills } from "@/components/home-skills";

const TEACHER_LINKS = [
  { href: "/tutors", label: "Teachers" },
  { href: "/tutors?mode=ONLINE", label: "Online teachers" },
  { href: "/tutors?mode=HOME", label: "Home teachers" },
  { href: "/tutors?mode=ASSIGNMENT", label: "Assignment help" },
];

const JOB_LINKS = [
  { href: "/jobs", label: "Teaching jobs" },
  { href: "/jobs?mode=ONLINE", label: "Online teaching" },
  { href: "/jobs?mode=HOME", label: "Home teaching" },
  { href: "/jobs?mode=ASSIGNMENT", label: "Assignment jobs" },
];

export default async function HomePage() {
  const [tutors, jobs, me, meta] = await Promise.all([
    listTutors({}).catch(() => []),
    listJobs({}).catch(() => []),
    getMe().catch(() => null),
    getMeta().catch(() => ({ subjects: [] as string[] })),
  ]);
  const signedIn = Boolean(me);

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-[rgb(var(--wtws-blue))] px-6 py-6 text-white sm:px-10 sm:py-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-400/20" />
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              WeTeacherWeStudent
            </span>
          </div>
          <h1 className="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl lg:text-4xl">
            Find online teachers and home tutors
          </h1>
          <p className="max-w-2xl text-sm font-normal leading-relaxed text-blue-100 sm:text-base">
            Search by skill and city, or post a job. Chat on WTWS. Phone and WhatsApp unlock after you pay.
          </p>
          <HomeHeroSearch />
          {signedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-10 items-center rounded-xl bg-white px-4 text-sm font-bold text-[rgb(var(--wtws-blue))]"
            >
              Go to dashboard
            </Link>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/register"
                className="inline-flex min-h-10 items-center rounded-xl bg-white px-4 text-sm font-bold text-[rgb(var(--wtws-blue))]"
              >
                Sign up free
              </Link>
              <Link
                href="/register?as=tutor"
                className="inline-flex min-h-10 items-center rounded-xl border border-white/40 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                Join as a tutor
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="browse" className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2">
        <CategoryColumn title="Teachers" count={`${tutors.length} published`} links={TEACHER_LINKS} />
        <CategoryColumn title="Teaching jobs" count={`${jobs.length} open`} links={JOB_LINKS} />
      </section>

      <HomeFeatured tutors={tutors} jobs={jobs} signedIn={signedIn} />

      <section className="relative overflow-hidden rounded-3xl bg-[rgb(var(--wtws-blue-dark))] p-6 text-white sm:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">High quality teachers</p>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Only published tutor profiles appear in search
            </h2>
            <p className="text-sm leading-relaxed text-blue-100 sm:text-base">
              Complete a teaching profile, set your rate, and stay visible. Students pay into escrow before contact is
              unlocked.
            </p>
          </div>
          <Link
            href={signedIn ? "/tutors/edit" : "/register?as=tutor"}
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[rgb(var(--wtws-blue))] hover:bg-slate-100 sm:text-base"
          >
            {signedIn ? "Edit teaching profile" : "Create tutor profile"}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <TrustCard
          title="Escrow payment protection"
          body="Student funds are held until the session is done. Release to the tutor, or dispute if it never happened."
        />
        <TrustCard
          title="Coins to apply"
          body="Tutors spend coins to apply to matching jobs. Chat stays in WTWS until the student pays."
        />
        <TrustCard
          title="Contact after pay"
          body="Phone and WhatsApp unlock only after escrow is funded. No leaking numbers in the first message."
        />
      </section>

      <HomeSkills live={meta.subjects} />
    </div>
  );
}

function CategoryColumn({
  title,
  count,
  links,
}: {
  title: string;
  count: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{count}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50/50 sm:text-base"
          >
            <span>{link.label}</span>
            <span className="text-xs text-slate-300 group-hover:text-[rgb(var(--wtws-blue))]">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TrustCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-6">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
