"use client";

import Link from "next/link";
import { PageHeader, StatCard, CompletedBadges } from "./ui/page-header";
import { ActionCard, InfoCard, Section, FilterButtons, EmptyState } from "./ui/cards";
import { Icons } from "./ui/icons";
import { JobCardView } from "@/components/job-card";
import type { JobCard } from "@wtws/shared";

export function StudentDashboard({
  name,
  coins,
  phone,
  jobs,
}: {
  name: string;
  coins: number;
  phone: string | null;
  jobs: JobCard[];
}) {
  const completedItems: string[] = [];
  if (phone) completedItems.push("Phone added");
  if (jobs.length > 0) completedItems.push(`${jobs.length} job${jobs.length > 1 ? "s" : ""} posted`);

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Student Dashboard"
        badgeColor="emerald"
        title="Student dashboard"
        subtitle={
          <>
            Hi <span className="font-medium">{name}</span>. Post a need, wait for applies, then connect in gurumates.
            <CompletedBadges items={completedItems} />
          </>
        }
      >
        <StatCard
          icon={<span className="text-emerald-600">{Icons.coin}</span>}
          label={`${coins} coins`}
          sublabel="Your wallet balance"
          badge="Available"
          badgeColor="emerald"
          href="/wallet"
          buttonText="Top Up Wallet"
          gradient
        />
      </PageHeader>

      <Section title="Quick Actions" badge="Get started" badgeColor="blue">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon={Icons.plus}
            title="Post a requirement"
            description="Tell tutors the subject, city, and budget. Get applications from qualified tutors."
            href="/jobs/new"
            buttonText="Post Requirement →"
          />
          <ActionCard
            icon={Icons.search}
            title="Find tutors"
            description="Browse verified tutor profiles by subject, location, and teaching mode."
            href="/tutors"
            buttonText="Browse Tutors"
            buttonVariant="outline"
          />
          <ActionCard
            icon={Icons.chat}
            title="Messages"
            description="Chat with tutors who applied to your jobs. Unlock contact after payment."
            href="/inbox"
            buttonText="View Messages"
            buttonVariant="outline"
          />
        </div>
      </Section>

      <Section title="My Requirements" badge={`${jobs.length} posted`} badgeColor="slate" rightText={jobs.length > 0 ? "Manage your job posts" : undefined}>
        {jobs.length === 0 ? (
          <EmptyState
            icon={Icons.document}
            title="No requirements posted yet"
            description="Post your first requirement to start receiving applications from qualified tutors."
            href="/jobs/new"
            buttonText="Post Your First Requirement"
          />
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 5).map((j) => (
              <JobCardView key={j.id} job={j} />
            ))}
            {jobs.length > 5 && (
              <Link
                href="/jobs/mine"
                className="block text-center text-sm font-semibold text-[rgb(var(--wtws-blue))] hover:underline"
              >
                View all {jobs.length} requirements →
              </Link>
            )}
          </div>
        )}
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
              <FilterButtons
                filters={[
                  { label: "Share Invite Link", href: "/wallet" },
                ]}
              />
            </div>
          </InfoCard>

          <InfoCard
            icon={<span className="text-teal-500">{Icons.briefcase}</span>}
            title="Browse all jobs"
            description="See what other students are looking for."
          >
            <div className="mt-3">
              <FilterButtons
                filters={[
                  { label: "All Jobs", href: "/jobs", active: true },
                  { label: "Online", href: "/jobs?mode=ONLINE" },
                  { label: "Home", href: "/jobs?mode=HOME" },
                ]}
              />
            </div>
          </InfoCard>
        </div>
      </Section>
    </div>
  );
}
