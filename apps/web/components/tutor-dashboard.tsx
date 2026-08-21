import Link from "next/link";
import { Card } from "@wtws/ui";

type Item = { href: string; title: string; body: string };

function Row({
  title,
  badge,
  items,
  tone,
}: {
  title: string;
  badge: string;
  items: Item[];
  tone: "urgent" | "boost" | "optional";
}) {
  if (items.length === 0) return null;
  const border =
    tone === "urgent"
      ? "border-red-200"
      : tone === "boost"
        ? "border-amber-200"
        : "border-[rgb(var(--border))]";
  const pill =
    tone === "urgent"
      ? "bg-red-50 text-red-700"
      : tone === "boost"
        ? "bg-amber-50 text-amber-800"
        : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]";

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill}`}>{badge}</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link key={item.href + item.title} href={item.href}>
            <Card className={`h-full ${border} transition hover:shadow-md`}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{item.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TutorDashboard({
  name,
  slug,
  coins,
  phone,
  profileReady,
  reviewCount,
  referralCode,
  isPremium,
}: {
  name: string;
  slug: string | null;
  coins: number;
  phone: string | null;
  profileReady: boolean;
  reviewCount: number;
  referralCode: string | null;
  isPremium: boolean;
}) {
  const action: Item[] = [];
  if (!profileReady) {
    action.push({ href: "/tutors/edit", title: "Complete profile", body: "Add headline, skills, rate, and city so students can find you." });
  }
  if (!phone) {
    action.push({ href: "/settings", title: "Add phone", body: "Students see this after they pay. Required for WhatsApp." });
  }

  const recommended: Item[] = [
    { href: "/jobs?matched=1", title: "Apply to jobs", body: "Use coins to unlock chat on jobs matching your skills." },
  ];
  if (reviewCount === 0) {
    recommended.push({ href: "/reviews", title: "Get reviews", body: "Students can review after they release escrow." });
  }
  if (!isPremium) {
    recommended.push({ href: "/wallet", title: "Early access", body: "Premium tutors see new jobs 1 hour first." });
  }

  const optional: Item[] = [
    { href: "/wallet", title: "Invite friends", body: referralCode ? `Share ${referralCode} — both of you get coins.` : "Earn coins for each referral." },
    { href: "/jobs", title: "Browse all jobs", body: "Online, home, and assignment posts." },
  ];

  const done: string[] = [];
  if (phone) done.push("Phone added");
  if (profileReady) done.push("Profile published");
  if (isPremium) done.push("Premium active");
  if (reviewCount > 0) done.push(`${reviewCount} review${reviewCount === 1 ? "" : "s"}`);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold">Tutor dashboard</h1>
          <p className="mt-1 text-[rgb(var(--muted-foreground))]">Hi {name}. Keep it simple — jobs, chat, then get paid.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {slug ? (
            <Link href={`/tutors/${slug}`} className="rounded-2xl border border-[rgb(var(--wtws-blue))] px-4 py-3 text-sm">
              <p className="font-semibold">My profile</p>
              <p className="text-[rgb(var(--muted-foreground))]">View public profile</p>
            </Link>
          ) : null}
          <Link href="/wallet" className="rounded-2xl border border-[rgb(var(--wtws-blue))] px-4 py-3 text-sm">
            <p className="font-semibold">{coins} coins</p>
            <p className="text-[rgb(var(--muted-foreground))]">Wallet balance</p>
          </Link>
        </div>
      </div>
      <Row title="Action needed" badge="Urgent" tone="urgent" items={action} />
      <Row title="Recommended" badge="Boost your profile" tone="boost" items={recommended} />
      <Row title="Optional" badge="Earn more coins" tone="optional" items={optional} />
      {done.length ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold">Completed</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {done.map((label) => (
              <span
                key={label}
                className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
              >
                {label}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
