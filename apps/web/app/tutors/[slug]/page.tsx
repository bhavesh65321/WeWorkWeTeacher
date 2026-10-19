import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@wtws/ui";
import {
  MODE_LABELS,
  SKILL_LEVEL_LABELS,
  TUTOR_GENDER_LABELS,
  TUTOR_WORKS_AS_LABELS,
  type TeachingMode,
  type TutorGender,
  type TutorReview,
  type TutorWorksAs,
  type SkillLevel,
} from "@wtws/shared";
import { getTutor, getMe } from "@/lib/api";
import { formatTutorFee } from "@/lib/money";
import { timeAgo } from "@/lib/time";
import { MessageTutorButton } from "@/components/message-tutor";
import { TutorAvatar } from "@/components/tutor-avatar";

type TutorDetail = Awaited<ReturnType<typeof getTutor>> & {
  isPremium?: boolean;
  reviews?: TutorReview[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gurumates.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tutor = await getTutor(slug);
    const subjects = tutor.subjects.slice(0, 3).join(", ") || "Tutor";
    const title = `${tutor.name} — ${subjects} Tutor`;
    const description = tutor.headline
      ? `${tutor.headline}. ${tutor.city ? `Based in ${tutor.city}.` : "Online tutor."} Book lessons on gurumates.`
      : `${subjects} tutor${tutor.city ? ` in ${tutor.city}` : ""}. Book lessons on gurumates.`;

    return {
      title,
      description,
      alternates: { canonical: `/tutors/${slug}` },
      openGraph: {
        title,
        description,
        type: "profile",
        url: `${SITE_URL}/tutors/${slug}`,
      },
      other: {
        "profile:first_name": tutor.name.split(" ")[0],
      },
    };
  } catch {
    return { title: "Tutor" };
  }
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export default async function TutorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let tutor: TutorDetail;
  try {
    tutor = await getTutor(slug);
  } catch {
    notFound();
  }

  const me = await getMe().catch(() => null);
  const reviews = tutor.reviews ?? [];
  const rating =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const isOwner = me?.id === tutor.userId;
  const approach = (tutor.teachingApproach ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  const genderLabel =
    tutor.gender && tutor.gender !== "UNDISCLOSED"
      ? TUTOR_GENDER_LABELS[tutor.gender as TutorGender]
      : null;
  const worksAs = TUTOR_WORKS_AS_LABELS[(tutor.worksAs as TutorWorksAs) ?? "INDIVIDUAL"];
  const trial =
    tutor.freeTrialMinutes && tutor.freeTrialMinutes > 0
      ? tutor.freeTrialMinutes >= 60
        ? `${tutor.freeTrialMinutes / 60} hour free trial`
        : `${tutor.freeTrialMinutes} min free trial`
      : null;

  const facts = [
    {
      label: "Location",
      value: tutor.city ? `${tutor.city}${tutor.country ? `, ${tutor.country}` : ""}` : "Online",
    },
    { label: "Teaches online", value: yesNo(tutor.modes.includes("ONLINE" as TeachingMode)) },
    { label: "At home / travel", value: yesNo(tutor.modes.includes("HOME") || tutor.modes.includes("TRAVEL")) },
    { label: "Homework help", value: yesNo(tutor.modes.includes("ASSIGNMENT")) },
    tutor.yearsTeaching != null ? { label: "Teaching experience", value: `${tutor.yearsTeaching} yrs` } : null,
    tutor.yearsOnline != null ? { label: "Online teaching", value: `${tutor.yearsOnline} yrs` } : null,
    tutor.registeredAt
      ? {
          label: "Registered",
          value: new Date(tutor.registeredAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }),
        }
      : null,
    tutor.lastSeenAt ? { label: "Last seen", value: timeAgo(tutor.lastSeenAt) } : null,
    genderLabel ? { label: "Gender", value: genderLabel } : null,
    { label: "Works as", value: worksAs },
    tutor.languages.length ? { label: "Languages", value: tutor.languages.join(", ") } : null,
    tutor.timezone ? { label: "Timezone", value: tutor.timezone } : null,
    {
      label: "Fee",
      value: formatTutorFee(tutor.rateType, tutor.hourlyRateMinor, tutor.hourlyRateMaxMinor, tutor.currency),
    },
    trial ? { label: "Free trial", value: trial } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <TutorAvatar name={tutor.name} photoUrl={tutor.photoUrl} className="h-20 w-20 text-2xl" />
          <div className="min-w-0">
            <h1 className="text-3xl font-bold">{tutor.name}</h1>
            <p className="mt-1 text-lg text-[rgb(var(--muted-foreground))]">
              {tutor.headline || tutor.subjects[0] || "Tutor"}
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              {rating
                ? `${rating} verified rating · ${reviews.length} session reviews`
                : "No reviews yet. Ratings appear after a paid session."}
              {tutor.isPremium ? " · Premium" : ""}
            </p>
          </div>
        </div>

        {tutor.bio ? (
          <section className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[rgb(var(--wtws-blue))]">About</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{tutor.bio}</p>
          </section>
        ) : null}

        {tutor.subjects.length || tutor.levels.length ? (
          <section className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[rgb(var(--wtws-blue))]">Subjects & skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(tutor.skills?.length ? tutor.skills : tutor.subjects.map((s) => ({ name: s, level: "INTERMEDIATE" }))).map(
                (s) => (
                  <Link key={s.name} href={`/subjects/${encodeURIComponent(s.name)}`}>
                    <Badge>
                      {s.name}
                      {s.level ? ` · ${SKILL_LEVEL_LABELS[s.level as SkillLevel] ?? s.level}` : ""}
                    </Badge>
                  </Link>
                ),
              )}
              {tutor.levels.map((l) => (
                <Badge key={l}>{l}</Badge>
              ))}
              {tutor.modes.map((m) => (
                <Badge key={m}>{MODE_LABELS[m]}</Badge>
              ))}
            </div>
          </section>
        ) : null}

        {approach.length ? (
          <section className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[rgb(var(--wtws-teal))]">Teaching approach</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
              {approach.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {tutor.experience ? (
          <section className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[rgb(var(--wtws-blue))]">Experience</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{tutor.experience}</p>
          </section>
        ) : null}

        {tutor.education ? (
          <section className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[rgb(var(--wtws-teal))]">Education</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{tutor.education}</p>
          </section>
        ) : null}

        <section className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[rgb(var(--wtws-teal))]">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
              No reviews yet. Be the first after a paid session.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border-t border-[rgb(var(--border))] pt-4 first:border-0 first:pt-0">
                  <p className="text-sm font-semibold">
                    {r.rating}/5 · {r.fromName} · {timeAgo(r.createdAt)}
                  </p>
                  {r.body ? <p className="mt-2 text-sm">{r.body}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
          <p className="text-2xl font-bold text-[rgb(var(--wtws-blue))]">
            {formatTutorFee(tutor.rateType, tutor.hourlyRateMinor, tutor.hourlyRateMaxMinor, tutor.currency)}
          </p>
          {trial ? <p className="mt-1 text-sm font-semibold text-[rgb(var(--wtws-teal))]">{trial}</p> : null}
          {isOwner ? (
            <Link
              href="/tutors/edit"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] px-4 text-sm font-semibold text-white"
            >
              Edit profile
            </Link>
          ) : me ? (
            <>
              <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
                Message in gurumates. Phone stays hidden until contact is unlocked.
              </p>
              <MessageTutorButton tutorUserId={tutor.userId} tutorName={tutor.name} />
              <Link
                href={`/jobs/new?subject=${encodeURIComponent(tutor.subjects[0] ?? "")}`}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[rgb(var(--border))] px-4 text-sm font-semibold"
              >
                Post a request
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
                Log in or sign up to message this tutor or post a request.
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(`/tutors/${tutor.slug}`)}`}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[rgb(var(--wtws-blue))] px-4 text-sm font-semibold text-white"
              >
                Log in to message
              </Link>
              <Link
                href={`/register?next=${encodeURIComponent(`/tutors/${tutor.slug}`)}`}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[rgb(var(--border))] px-4 text-sm font-semibold"
              >
                Sign up
              </Link>
              <Link
                href={`/login?next=${encodeURIComponent(`/jobs/new?subject=${encodeURIComponent(tutor.subjects[0] ?? "")}`)}`}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[rgb(var(--border))] px-4 text-sm font-semibold"
              >
                Log in to post a request
              </Link>
            </>
          )}
        </div>
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-5 shadow-sm">
          <h2 className="font-semibold">At a glance</h2>
          <dl className="mt-3 space-y-3 text-sm">
            {facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-3">
                <dt className="text-[rgb(var(--muted-foreground))]">{f.label}</dt>
                <dd className="max-w-[60%] text-right font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
