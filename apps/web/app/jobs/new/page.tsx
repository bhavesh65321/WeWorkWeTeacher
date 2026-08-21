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
  return <JobRequirementForm prefillSubject={subject} />;
}
