"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/client";
import { JobRequirementForm } from "@/components/job-requirement-form";
import type { JobCard } from "@wtws/shared";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobCard | null>(null);

  useEffect(() => {
    apiClient<JobCard>(`/jobs/${id}`)
      .then(setJob)
      .catch(() => router.push("/jobs/mine"));
  }, [id, router]);

  if (!job) return <p>Loading…</p>;
  return <JobRequirementForm job={job} />;
}
