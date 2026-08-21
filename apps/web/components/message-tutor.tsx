"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea } from "@wtws/ui";
import { apiClient } from "@/lib/client";

export function MessageTutorButton({ tutorUserId, tutorName }: { tutorUserId: string; tutorName: string }) {
  const router = useRouter();
  const [message, setMessage] = useState(`Hi ${tutorName.split(" ")[0]}, I would like help with your subject.`);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient<{ conversationId: string }>("/tutors/message", {
        method: "POST",
        body: JSON.stringify({ tutorUserId, message }),
      });
      router.push(`/inbox/${res.conversationId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <Textarea className="min-h-24" value={message} onChange={(e) => setMessage(e.target.value)} minLength={12} required />
      {error ? (
        <p className="text-sm text-red-600">
          {error}
          {error.toLowerCase().includes("not enough coins") ? (
            <>
              {" "}
              <a href="/wallet" className="font-semibold underline">
                Buy coins
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Message · 50 coins"}
      </Button>
    </form>
  );
}
