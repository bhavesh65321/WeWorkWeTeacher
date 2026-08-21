"use client";

import { useEffect, useState } from "react";

export default function StatusPage() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/health`)
      .then((r) => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold">Status</h1>
      <p className="mt-4 rounded-2xl border border-[rgb(var(--border))] p-4">
        API: {ok === null ? "Checking…" : ok ? "Operational" : "Degraded"}
      </p>
      <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
        Classroom video is not in Open GA. Chat, jobs, and payments are the live path.
      </p>
    </div>
  );
}
