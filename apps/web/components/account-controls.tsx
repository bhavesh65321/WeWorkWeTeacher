"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@wtws/ui";
import { apiClient } from "@/lib/client";

export function AccountControls() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function exportData() {
    setError("");
    const data = await apiClient<unknown>("/auth/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wtws-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;
    setError("");
    try {
      await apiClient("/auth/me", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <div className="mt-8 max-w-md rounded-2xl border border-[rgb(var(--border))] p-4">
      <h2 className="font-semibold">Your data</h2>
      <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Export a copy or close the account (GDPR).</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => exportData().catch((e) => setError(String(e)))}>
          Export my data
        </Button>
        <Button type="button" variant="outline" onClick={deleteAccount}>
          Delete account
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
