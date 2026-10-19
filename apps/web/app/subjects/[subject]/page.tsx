import type { Metadata } from "next";
import Link from "next/link";
import { listTutors } from "@/lib/api";
import { TutorCardView } from "@/components/tutor-card";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gurumates.com";

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);
  const title = `${decoded} Tutors — Find ${decoded} Teachers Online & Near You`;
  const description = `Find verified ${decoded} tutors for online or in-person lessons. Compare rates, read reviews, and book lessons on gurumates.`;

  return {
    title,
    description,
    alternates: { canonical: `/subjects/${subject}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/subjects/${subject}`,
    },
    keywords: [
      `${decoded} tutor`,
      `${decoded} teacher`,
      `learn ${decoded}`,
      `${decoded} lessons`,
      `${decoded} classes`,
      `online ${decoded} tutor`,
    ],
  };
}

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);
  const tutors = await listTutors({ subject: decoded }).catch(() => []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${decoded} Tutors`,
    description: `Find ${decoded} tutors on gurumates`,
    numberOfItems: tutors.length,
    itemListElement: tutors.slice(0, 10).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: t.name,
        jobTitle: `${decoded} Tutor`,
        url: `${SITE_URL}/tutors/${t.slug}`,
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-2">
        <Link href="/tutors" className="text-sm text-[rgb(var(--wtws-blue))] hover:underline">
          ← All tutors
        </Link>
      </div>
      <h1 className="text-3xl font-bold">{decoded} tutors</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Find verified {decoded} teachers — online lessons or in-person near you.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutors.map((t) => (
          <TutorCardView key={t.id} tutor={t} />
        ))}
      </div>
      {tutors.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No published tutors for {decoded} yet.</p>
          <Link
            href="/jobs/new"
            className="mt-4 inline-block rounded-lg bg-[rgb(var(--wtws-blue))] px-6 py-2 text-sm font-semibold text-white"
          >
            Post a requirement
          </Link>
        </div>
      )}
    </div>
  );
}
