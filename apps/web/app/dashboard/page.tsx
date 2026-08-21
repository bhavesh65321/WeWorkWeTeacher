import { redirect } from "next/navigation";
import { getMe, apiGet } from "@/lib/api";
import type { JobCard, TutorCard } from "@wtws/shared";
import { TutorDashboard } from "@/components/tutor-dashboard";
import { StudentDashboard } from "@/components/student-dashboard";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const me = await getMe();
  if (!me) redirect("/login");

  const jobs = me.activeRole === "STUDENT" ? await apiGet<JobCard[]>("/jobs/mine").catch(() => []) : [];
  const tutor =
    me.activeRole === "TUTOR" ? await apiGet<TutorCard>("/tutors/me").catch(() => null) : null;

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
