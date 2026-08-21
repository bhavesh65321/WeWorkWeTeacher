import Link from "next/link";

export const metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">How WTWS works</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Same marketplace loop as TeacherOn — search, post, coins, apply — then pay on WTWS. Built-in classroom is later; after pay you chat here or on WhatsApp.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-[rgb(var(--border))] p-6">
          <h2 className="text-xl font-bold">For students</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
            <li>Search tutors (All / Online / Home / Assignment) or post a requirement.</li>
            <li>Message a tutor with starter coins, or wait for tutors to apply to your post.</li>
            <li>Chat in WTWS. Phone and WhatsApp unlock after you pay for a session.</li>
            <li>Book, pay into escrow (12% platform fee on payout), then review. Dispute if the session never happened.</li>
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
            <li>Chat, get booked, teach (chat / WhatsApp after pay), and receive payout when the student releases escrow.</li>
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
    </div>
  );
}
