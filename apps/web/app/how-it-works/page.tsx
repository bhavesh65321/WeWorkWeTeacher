import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How gurumates Works — Find Tutors, Post Jobs, Connect Safely",
  description:
    "Learn how gurumates connects students with tutors. Post requirements free, browse tutors, chat safely, and unlock contact when ready. Simple, safe, effective.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How gurumates Works",
    description: "Learn how gurumates connects students with tutors safely and effectively.",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">How gurumates works</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Search tutors, post a need, apply with coins, then connect on gurumates. Built-in classroom is later; after unlocking contact you chat here or on WhatsApp.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-[rgb(var(--border))] p-6">
          <h2 className="text-xl font-bold">For students</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
            <li>Search tutors (All / Online / Home / Assignment) or post a requirement.</li>
            <li>Message a tutor with starter coins, or wait for tutors to apply to your post.</li>
            <li>Chat in gurumates. Phone and WhatsApp unlock when you spend coins to unlock contact.</li>
            <li>Schedule sessions, connect directly via WhatsApp/call, then leave a review.</li>
          </ol>
          <div className="mt-6 flex gap-3">
            <Link href="/tutors" className="font-semibold text-[rgb(var(--wtws-blue))]">
              Find tutors
            </Link>
            <Link href="/jobs/new" className="font-semibold text-[rgb(var(--wtws-blue))]">
              Post a job
            </Link>
          </div>
        </section>
        <section className="rounded-2xl border border-[rgb(var(--border))] p-6">
          <h2 className="text-xl font-bold">For tutors</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
            <li>Complete your teaching profile (skills, rate, city, how you teach).</li>
            <li>Open Tutor jobs. Apply with coins — or wait for jobs matching your skills to go free.</li>
            <li>Premium gets 1-hour early access and higher search ranking.</li>
            <li>Chat, get booked, teach (chat / WhatsApp after contact unlock), and receive payment directly.</li>
          </ol>
          <div className="mt-6 flex gap-3">
            <Link href="/jobs" className="font-semibold text-[rgb(var(--wtws-blue))]">
              Tutor jobs
            </Link>
            <Link href="/tutors/edit" className="font-semibold text-[rgb(var(--wtws-blue))]">
              Edit profile
            </Link>
          </div>
        </section>
      </div>
      <section className="mt-10 rounded-2xl border border-[rgb(var(--border))] p-6">
        <h2 className="text-xl font-bold">Payment methods</h2>
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Buy coin packs using Cards or UPI via Stripe. Coins are used to:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          <li><strong>Apply to jobs</strong> — Tutors spend coins to apply to student job posts</li>
          <li><strong>Message tutors</strong> — Students spend coins to start conversations</li>
          <li><strong>Unlock contacts</strong> — Spend coins to reveal phone/WhatsApp</li>
          <li><strong>Premium upgrade</strong> — Get early access to new jobs</li>
        </ul>
      </section>
    </div>
  );
}
