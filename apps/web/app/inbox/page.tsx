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
    <div className="mx-auto max-w-2xl">
      <ConfirmCheckout />
      <h1 className="text-3xl font-bold">Messages</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Chat here anytime. Phone and WhatsApp appear after the student pays.
      </p>
      <div className="mt-6 divide-y divide-[rgb(var(--border))] rounded-2xl border border-[rgb(var(--border))]">
        {threads.map((t) => (
          <Link key={t.id} href={`/inbox/${t.id}`} className="block px-4 py-4 hover:bg-[rgb(var(--muted))]">
            <div className="flex justify-between gap-3">
              <p className="font-semibold">{t.otherName}</p>
              {t.escrowFunded ? <span className="text-xs font-medium text-[rgb(var(--wtws-teal))]">Paid</span> : null}
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{t.jobTitle}</p>
            <p className="mt-1 line-clamp-2 break-words text-sm sm:line-clamp-1">{t.lastMessage}</p>
          </Link>
        ))}
      </div>
      {threads.length === 0 ? (
        <p className="mt-8 text-[rgb(var(--muted-foreground))]">No threads yet. Apply to a job or message a tutor.</p>
      ) : null}
    </div>
  );
}
