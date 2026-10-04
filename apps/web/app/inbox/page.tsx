import Link from "next/link";
import { redirect } from "next/navigation";
import { apiGet, getMe } from "@/lib/api";
import { ConfirmCheckout } from "@/components/confirm-checkout";

export const metadata = { title: "Messages" };

type Thread = {
  id: string;
  otherName: string;
  jobTitle: string;
  lastMessage: string;
  lastAt: string | null;
  escrowFunded: boolean;
};

export default async function InboxPage() {
  const me = await getMe();
  if (!me) redirect("/login");
  const threads = await apiGet<Thread[]>("/conversations").catch(() => []);

  return (
    <div className="space-y-8">
      <ConfirmCheckout />
      
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Messages
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Inbox</h1>
          <p className="mt-2 text-slate-600">
            Chat here anytime. Phone and WhatsApp appear after the student pays.
          </p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {threads.length} threads
          </span>
        </div>

        {threads.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {threads.map((t) => (
              <Link 
                key={t.id} 
                href={`/inbox/${t.id}`} 
                className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{t.otherName}</p>
                    {t.escrowFunded && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Paid
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{t.jobTitle}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-600">{t.lastMessage}</p>
                </div>
                <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">No conversations yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Apply to a job or message a tutor to start a conversation.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/jobs"
                className="rounded-xl bg-[rgb(var(--wtws-blue))] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--wtws-blue-dark))]"
              >
                Browse Jobs
              </Link>
              <Link
                href="/tutors"
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Find Tutors
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
