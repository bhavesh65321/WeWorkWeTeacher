"use client";

import Link from "next/link";
import { PageHeader, StatCard, CompletedBadges } from "./ui/page-header";
import { ActionCard, InfoCard, Section, FilterButtons } from "./ui/cards";
import { Icons } from "./ui/icons";

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
  const completedItems: string[] = [];
  if (phone) completedItems.push("Phone added");
  if (profileReady) completedItems.push("Profile published");
  if (isPremium) completedItems.push("Identity Verified");

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Tutor Dashboard"
        badgeColor="blue"
        title="Tutor dashboard"
        subtitle={
          <>
            Hi <span className="font-medium">{name}</span>. Keep it simple —{" "}
            <Link href="/jobs" className="text-[rgb(var(--wtws-blue))] hover:underline">jobs</Link>,{" "}
            <Link href="/inbox" className="text-[rgb(var(--wtws-blue))] hover:underline">chat</Link>, then{" "}
            <Link href="/wallet" className="text-[rgb(var(--wtws-blue))] hover:underline">get paid</Link>.
            <CompletedBadges items={completedItems} />
          </>
        }
      >
        {slug && (
          <StatCard
            icon={<span className="text-slate-600">{Icons.user}</span>}
            label="My profile"
            sublabel="Visible to students searching tutors"
            badge="Public"
            badgeColor="emerald"
            href={`/tutors/${slug}`}
            buttonText="View public profile"
          />
        )}
        <StatCard
          icon={<span className="text-emerald-600">{Icons.coin}</span>}
          label={`${coins} coins`}
          sublabel="Wallet balance for lead unlocks"
          badge="Available"
          badgeColor="emerald"
          href="/wallet"
          buttonText="Top Up Wallet"
          gradient
        />
      </PageHeader>

      <Section title="Recommended" badge="Boost your profile" badgeColor="orange" rightText="3 key steps to maximize leads">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon={Icons.send}
            title="Apply to jobs"
            description="Use coins to unlock chat on jobs matching your subjects and location preferences."
            href="/jobs"
            buttonText="Browse Matches →"
          />
          <ActionCard
            icon={Icons.star}
            title="Get reviews"
            description="Students can review your teaching after completing sessions with you."
            href="/reviews"
            buttonText="✨ Request Student Review"
          />
          <ActionCard
            icon={Icons.bolt}
            title="Early access"
            description="Premium tutors see new student job posts 1 hour before standard listing display."
            href="/wallet"
            buttonText="✨ Upgrade to Premium"
            buttonVariant="premium"
            badge={isPremium ? undefined : "PREMIUM"}
          />
        </div>
      </Section>

      <Section title="Optional" badge="Earn more coins" badgeColor="slate">
        <div className="grid gap-4 lg:grid-cols-2">
          <InfoCard
            icon={<span className="text-blue-500">{Icons.users}</span>}
            title="Invite friends"
            description="Both of you get free coin bonuses on registration."
            badge="+20 Coins"
            badgeColor="emerald"
          >
            <div className="mt-3">
              <p className="text-[10px] font-medium uppercase text-slate-400">Your invite link</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded bg-slate-100 px-2 py-1 text-sm font-mono text-slate-700">
                  {referralCode || "wtws-invite"}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(referralCode || "")}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {Icons.copy}
                  Copy
                </button>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            icon={<span className="text-teal-500">{Icons.briefcase}</span>}
            title="Browse all jobs"
            description="Explore online, home tutoring, and assignment posts worldwide."
          >
            <div className="mt-3">
              <FilterButtons
                filters={[
                  { label: "All Categories", href: "/jobs", active: true },
                  { label: "Online", href: "/jobs?mode=ONLINE" },
                  { label: "Home", href: "/jobs?mode=HOME" },
                  { label: "Assignments", href: "/jobs?mode=ASSIGNMENT" },
                ]}
              />
            </div>
          </InfoCard>
        </div>
      </Section>
    </div>
  );
}
