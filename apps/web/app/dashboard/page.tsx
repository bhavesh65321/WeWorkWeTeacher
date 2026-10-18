import { redirect } from "next/navigation";
import { getMe, apiGet } from "@/lib/api";
import type { JobCard, TutorCard } from "@wtws/shared";
import { TutorDashboard } from "@/components/tutor-dashboard";
import { StudentDashboard } from "@/components/student-dashboard";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const me = await getMe();
  if (!me) redirect("/login");

  const [jobs, matchedJobs, tutor] = await Promise.all([
    me.activeRole === "STUDENT" ? apiGet<JobCard[]>("/jobs/mine").catch(() => []) : Promise.resolve([]),
    me.activeRole === "TUTOR" ? apiGet<JobCard[]>("/jobs?matched=1").catch(() => []) : Promise.resolve([]),
    me.activeRole === "TUTOR" ? apiGet<TutorCard>("/tutors/me").catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <div>
      {me.activeRole === "TUTOR" ? (
        <TutorDashboard
          name={me.name.split(" ")[0]}
          slug={me.tutorSlug}
          coins={me.coinBalance}
          phone={me.phone}
          profileReady={me.tutorOnboardingComplete}
          reviewCount={tutor?.reviewCount ?? 0}
          referralCode={me.referralCode}
          isPremium={me.isPremium}
          matchedJobs={matchedJobs}
        />
      ) : (
        <StudentDashboard
          name={me.name.split(" ")[0]}
          coins={me.coinBalance}
          phone={me.phone}
          jobs={jobs}
        />
      )}
    </div>
  );
}
