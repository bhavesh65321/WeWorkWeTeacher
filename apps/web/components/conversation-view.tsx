"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import { formatMoney } from "@/lib/money";
import { ContactUnlockPanel } from "./contact-unlock-panel";

type Msg = { id: string; senderId: string; body: string; createdAt: string; mine: boolean };
type Booking = {
  id: string;
  startsAt: string;
  durationMin: number;
  amountMinor: number;
  currency: string;
  status: string;
  review: { id: string } | null;
};

type Thread = {
  id: string;
  otherName: string;
  otherPhone: string | null;
  isStudent: boolean;
  jobTitle: string;
  contactUnlocked: boolean;
  unlockBlockers: string[];
  messages: Msg[];
  bookings: Booking[];
};

export function ConversationView({ id }: { id: string }) {
  const router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [rating, setRating] = useState(5);
  const [unlocking, setUnlocking] = useState(false);

  async function load() {
    const data = await apiClient<Thread>(`/conversations/${id}`);
    setThread(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
    const t = setInterval(() => load().catch(() => undefined), 3000);
    return () => clearInterval(t);
  }, [id]);

  async function send(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await apiClient(`/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ body }) });
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    }
  }

  async function unlockContact() {
    setUnlocking(true);
    setError("");
    try {
      await apiClient(`/conversations/${id}/unlock`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock");
    } finally {
      setUnlocking(false);
    }
  }

  async function book(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await apiClient("/bookings", {
        method: "POST",
        body: JSON.stringify({ conversationId: id, startsAt: new Date(startsAt).toISOString(), durationMin: 60 }),
      });
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book");
    }
  }

  if (!thread) return <p className="text-[rgb(var(--muted-foreground))]">{error || "Loading…"}</p>;
  const latest = thread.bookings[0];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
      <div className="flex min-w-0 flex-col">
        <h1 className="break-words text-xl font-bold sm:text-2xl">{thread.otherName}</h1>
        <p className="break-words text-sm text-[rgb(var(--muted-foreground))]">{thread.jobTitle}</p>
        <div className="mt-3">
          <ContactUnlockPanel
            contactUnlocked={thread.contactUnlocked}
            unlockBlockers={thread.unlockBlockers ?? []}
            otherName={thread.otherName}
            otherPhone={thread.otherPhone}
            jobTitle={thread.jobTitle}
            unlocking={unlocking}
            onUnlock={unlockContact}
          />
        </div>
        <div className="mt-4 flex min-w-0 flex-1 flex-col gap-2 sm:mt-6">
          {thread.messages.map((m) => (
            <div key={m.id} className={`flex min-w-0 ${m.mine ? "justify-end" : "justify-start"}`}>
              <p
                className={`w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-snug [overflow-wrap:anywhere] sm:max-w-[75%] sm:px-3.5 md:max-w-[28rem] ${
                  m.mine
                    ? "rounded-br-md bg-[rgb(var(--wtws-blue))] text-white"
                    : "rounded-bl-md bg-[rgb(var(--muted))]"
                }`}
              >
                {m.body}
              </p>
            </div>
          ))}
        </div>
        <form
          onSubmit={send}
          className="sticky bottom-0 z-10 mt-3 flex min-w-0 items-end gap-2 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 sm:static sm:mt-4 sm:max-w-xl sm:pb-0"
        >
          <Textarea
            className="min-h-11 min-w-0 max-h-32 flex-1 resize-none py-2.5 text-base sm:text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message in WTWS chat"
            required
            rows={1}
          />
          <Button type="submit" className="shrink-0 px-3 sm:px-4">
            Send
          </Button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
      <aside className="min-w-0 space-y-4 md:sticky md:top-20 md:self-start">
        {thread.isStudent ? (
        <div className="rounded-2xl border border-[rgb(var(--border))] p-4">
          <h2 className="font-semibold">Schedule a session</h2>
          <form onSubmit={book} className="mt-3 space-y-2">
            <Input
              type="datetime-local"
              className="min-w-0 text-base sm:text-sm"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Request 60 min
            </Button>
          </form>
        </div>
        ) : (
          <p className="rounded-2xl border border-[rgb(var(--border))] p-4 text-sm text-[rgb(var(--muted-foreground))]">
            The student schedules sessions. Payment is handled via coins.
          </p>
        )}
        {latest ? (
          <div className="rounded-2xl border border-[rgb(var(--border))] p-4 text-sm">
            <p className="font-semibold">{formatMoney(latest.amountMinor, latest.currency)}</p>
            <p className="mt-1 text-[rgb(var(--muted-foreground))]">
              {new Date(latest.startsAt).toLocaleString()} · {latest.status}
            </p>
            {thread.isStudent && latest.status === "REQUESTED" ? (
              <Button
                className="mt-3 w-full"
                type="button"
                onClick={async () => {
                  setError("");
                  try {
                    await apiClient(`/bookings/${latest.id}/confirm`, { method: "POST" });
                    await load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not confirm");
                  }
                }}
              >
                Confirm booking
              </Button>
            ) : null}
            {latest.status === "CONFIRMED" ? (
              <Button
                className="mt-3 w-full"
                type="button"
                variant="secondary"
                onClick={async () => {
                  setError("");
                  try {
                    await apiClient(`/bookings/${latest.id}/complete`, { method: "POST" });
                    await load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not complete");
                  }
                }}
              >
                Mark as completed
              </Button>
            ) : null}
            {thread.isStudent && latest.status === "COMPLETED" && !latest.review ? (
              <form
                className="mt-3 space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  try {
                    await apiClient(`/bookings/${latest.id}/review`, {
                      method: "POST",
                      body: JSON.stringify({ rating, body: "Great session" }),
                    });
                    await load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not review");
                  }
                }}
              >
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                />
                <Button type="submit" className="w-full">
                  Leave review
                </Button>
              </form>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
