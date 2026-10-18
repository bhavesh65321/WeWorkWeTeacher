"use client";

import Link from "next/link";
import { Button } from "@wtws/ui";

export function ContactUnlockPanel({
  contactUnlocked,
  unlockBlockers,
  otherName,
  otherPhone,
  jobTitle,
  unlocking,
  onUnlock,
}: {
  contactUnlocked: boolean;
  unlockBlockers: string[];
  otherName: string;
  otherPhone: string | null;
  jobTitle: string;
  unlocking: boolean;
  onUnlock: () => void;
}) {
  if (contactUnlocked && otherPhone) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-800">Contact unlocked</p>
        </div>
        <p className="mt-2 break-all text-base font-semibold tabular-nums text-slate-900 sm:text-lg">
          {otherPhone}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <a
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white hover:bg-[#1ebe57]"
            href={whatsappHref(otherPhone, `Hi ${otherName}, about ${jobTitle} on WTWS.`)}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <a
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href={`tel:${otherPhone}`}
          >
            <PhoneIcon className="h-4 w-4" /> Call
          </a>
        </div>
      </div>
    );
  }

  if (contactUnlocked && !otherPhone) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
        <p className="text-sm font-semibold text-amber-800">Contact unlocked</p>
        <p className="mt-1 text-sm text-amber-700">
          {otherName} hasn&apos;t added a phone yet. Chat here until they do.
        </p>
      </div>
    );
  }

  const needsCoins = unlockBlockers.includes("COINS");
  const needsEmail = unlockBlockers.includes("EMAIL");
  const needsPhone = unlockBlockers.includes("PHONE");

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2">
        <LockIcon className="h-4 w-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-800">Contact locked</p>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Phone and WhatsApp unlock after you complete the steps below.
      </p>

      <ul className="mt-3 space-y-2">
        <ChecklistItem done={!needsCoins} label="Spend 10 coins to unlock contact" />
        <ChecklistItem done={!needsEmail} label="Verify your email" href={needsEmail ? "/verify" : undefined} />
        <ChecklistItem done={!needsPhone} label="Verify your phone" href={needsPhone ? "/verify" : undefined} />
      </ul>

      {needsCoins && (
        <Button
          className="mt-3 w-full"
          type="button"
          onClick={onUnlock}
          disabled={unlocking}
        >
          {unlocking ? "Unlocking…" : "Unlock contact · 10 coins"}
        </Button>
      )}
    </div>
  );
}

function ChecklistItem({ done, label, href }: { done: boolean; label: string; href?: string }) {
  const content = (
    <div className="flex items-start gap-2">
      {done ? (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <EmptyCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
      )}
      <span className={`text-sm ${done ? "text-slate-500 line-through" : "text-slate-700"}`}>
        {label}
      </span>
    </div>
  );
  if (href && !done) {
    return (
      <li>
        <Link href={href} className="block hover:text-blue-600">{content}</Link>
      </li>
    );
  }
  return <li>{content}</li>;
}

function whatsappHref(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EmptyCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
