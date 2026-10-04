import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { JobRequirementForm } from "@/components/job-requirement-form";

export const metadata = { title: "Post a request" };

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await getMe().catch(() => null);
  const sp = await searchParams;
  const subject = typeof sp.subject === "string" ? sp.subject : "";
  const qs = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  if (!me) redirect(`/login?next=${encodeURIComponent(`/jobs/new${qs}`)}`);
  
  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          New Requirement
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Post a requirement</h1>
        <p className="mt-2 text-slate-600">
          Tell tutors what you need. Get applications from qualified tutors within hours.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <JobRequirementForm prefillSubject={subject} />
      </div>
    </div>
  );
}
