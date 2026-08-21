"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import type { JobApplicant } from "@wtws/shared";

export function JobOwnerPanel({
  jobId,
  status,
  applicants,
}: {
  jobId: string;
  status: string;
  applicants: JobApplicant[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function setStatus(next: "OPEN" | "CLOSED" | "FILLED") {
    setError("");
    try {
      await apiClient(`/jobs/${jobId}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update");
    }
  }

  return (
    <div className="mt-8 space-y-4 rounded-2xl border border-[rgb(var(--border))] p-5">
      <h2 className="font-semibold">Your post</h2>
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Status: {status}. Close it when you no longer need applicants, or mark filled when you hire someone.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/jobs/${jobId}/edit`}
          className="inline-flex min-h-10 items-center rounded-lg border border-[rgb(var(--border))] px-3 text-sm font-semibold"
        >
          Edit
        </Link>
        {status !== "OPEN" ? (
          <Button type="button" variant="secondary" onClick={() => setStatus("OPEN")}>
            Reopen
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setStatus("CLOSED")}>
            Close post
          </Button>
        )}
        {status !== "FILLED" ? (
          <Button type="button" onClick={() => setStatus("FILLED")}>
            Mark filled
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <h3 className="text-sm font-semibold">Tutors who applied ({applicants.length})</h3>
        {applicants.length === 0 ? (
          <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">No applications yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[rgb(var(--border))]">
            {applicants.map((a) => (
              <li key={a.conversationId} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  {a.tutorSlug ? (
                    <Link href={`/tutors/${a.tutorSlug}`} className="font-semibold text-[rgb(var(--wtws-blue))]">
                      {a.tutorName}
                    </Link>
                  ) : (
                    <span className="font-semibold">{a.tutorName}</span>
                  )}
                </span>
                <Link href={`/inbox/${a.conversationId}`} className="font-semibold text-[rgb(var(--wtws-blue))]">
                  Message
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
