"use client";

import Link from "next/link";
import type { JobCard } from "@wtws/shared";
import { PageHeader, StatCard, CompletedBadges } from "./ui/page-header";
import { ActionCard, InfoCard, Section, FilterButtons, EmptyState } from "./ui/cards";
import { Icons } from "./ui/icons";
import { JobCardView } from "./job-card";

export function TutorDashboard({
  name,
  slug,
  coins,
  phone,
  profileReady,
  reviewCount: _reviewCount,
  referralCode,
  isPremium,
  matchedJobs,
}: {
  name: string;
  slug: string | null;
  coins: number;
  phone: string | null;
  profileReady: boolean;
  reviewCount: number;
  referralCode: string | null;
  isPremium: boolean;
  matchedJobs: JobCard[];
}) {
  const completedItems: string[] = [];
  if (phone) completedItems.push("Phone added");
  if (profileReady) completedItems.push("Profile published");
  if (isPremium) completedItems.push("Premium");

  const incompleteProfile = !profileReady;
  const missingPhone = !phone;

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Tutor Dashboard"
        badgeColor="blue"
        title="Tutor dashboard"
        subtitle={
          <>
            Hi <span className="font-medium">{name}</span>. Browse matched jobs, chat, and get paid.
            <CompletedBadges items={completedItems} />
          </>
        }
      >
        <StatCard
          icon={<span className="text-emerald-600">{Icons.coin}</span>}
          label={`${coins} coins`}
          sublabel="Wallet balance"
          badge="Available"
          badgeColor="emerald"
          href="/wallet"
          buttonText="Top Up Wallet"
          gradient
        />
      </PageHeader>

      {(incompleteProfile || missingPhone) && (
        <Section title="Finish setup" badge="Required" badgeColor="orange">
          <div className="grid gap-4 sm:grid-cols-2">
            {incompleteProfile && (
              <ActionCard
                icon={Icons.user}
                title="Complete your profile"
                description="Add skills, rate, bio, and photo so students can find you."
                href="/tutors/edit"
                buttonText="Complete profile →"
              />
            )}
            {missingPhone && (
              <ActionCard
                icon={Icons.phone}
                title="Add your phone"
                description="Students unlock your phone after paying. Required for bookings."
                href="/settings"
                buttonText="Add phone →"
                buttonVariant="outline"
              />
            )}
          </div>
        </Section>
      )}

      <Section
        title="Jobs for you"
        badge={`${matchedJobs.length} matched`}
        badgeColor="blue"
        rightText={matchedJobs.length > 0 ? "Based on your skills, languages, and modes" : undefined}
      >
        {matchedJobs.length === 0 ? (
          <EmptyState
            icon={Icons.search}
            title="No matches yet"
            description={
              profileReady
                ? "Check back soon — new jobs are posted every day."
                : "Complete your tutor profile to get matched to jobs."
            }
            href={profileReady ? "/jobs" : "/tutors/edit"}
            buttonText={profileReady ? "Browse all jobs" : "Complete profile"}
          />
        ) : (
          <div className="space-y-3">
            {matchedJobs.slice(0, 5).map((job) => (
              <JobCardView key={job.id} job={job} />
            ))}
            {matchedJobs.length > 5 && (
              <Link
                href="/jobs?matched=1"
                className="block text-center text-sm font-semibold text-[rgb(var(--wtws-blue))] hover:underline"
              >
                View all {matchedJobs.length} matched jobs →
              </Link>
            )}
          </div>
        )}
      </Section>

      <Section title="Quick actions" badge="Grow your work" badgeColor="slate">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slug && (
            <ActionCard
              icon={Icons.user}
              title="View public profile"
              description="See how students view your profile."
              href={`/tutors/${slug}`}
              buttonText="View profile"
              buttonVariant="outline"
            />
          )}
          <ActionCard
            icon={Icons.bolt}
            title={isPremium ? "Premium active" : "Get Premium"}
            description="See new jobs 1 hour before free tutors. Higher search ranking."
            href="/wallet"
            buttonText={isPremium ? "Manage" : "Upgrade"}
            buttonVariant={isPremium ? "outline" : "premium"}
            badge={isPremium ? undefined : "PREMIUM"}
          />
          <ActionCard
            icon={Icons.chat}
            title="Inbox"
            description="Chat with students who have applied or messaged you."
            href="/inbox"
            buttonText="Open inbox"
            buttonVariant="outline"
          />
        </div>
      </Section>

      <Section title="More" badge="Earn more coins" badgeColor="slate">
        <div className="grid gap-4 lg:grid-cols-2">
          <InfoCard
            icon={<span className="text-blue-500">{Icons.users}</span>}
            title="Invite friends"
            description="Both of you get free coin bonuses on registration."
            badge="+20 Coins"
            badgeColor="emerald"
          >
            <div className="mt-3">
              <p className="text-[10px] font-medium uppercase text-slate-400">Your invite code</p>
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
            description="See everything, not just matches."
          >
            <div className="mt-3">
              <FilterButtons
                filters={[
                  { label: "All", href: "/jobs", active: true },
                  { label: "Online", href: "/jobs?mode=ONLINE" },
                  { label: "Home", href: "/jobs?mode=HOME" },
                  { label: "Assignment", href: "/jobs?mode=ASSIGNMENT" },
                ]}
              />
            </div>
          </InfoCard>
        </div>
      </Section>
    </div>
  );
}
