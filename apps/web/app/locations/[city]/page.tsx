import type { Metadata } from "next";
import Link from "next/link";
import { listTutors } from "@/lib/api";
import { TutorCardView } from "@/components/tutor-card";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gurumates.com";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const decoded = decodeURIComponent(city);
  const title = `Tutors in ${decoded} — Find Home & Online Tutors Near You`;
  const description = `Find verified tutors in ${decoded} for any subject. Home tuition, online classes, or both. Compare rates and book on gurumates.`;

  return {
    title,
    description,
    alternates: { canonical: `/locations/${city}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/locations/${city}`,
    },
    keywords: [
      `tutors in ${decoded}`,
      `${decoded} tutors`,
      `home tuition ${decoded}`,
      `private tutors ${decoded}`,
      `online tutors ${decoded}`,
    ],
  };
}

export default async function LocationPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const decoded = decodeURIComponent(city);
  const tutors = await listTutors({ city: decoded }).catch(() => []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Tutors in ${decoded}`,
    description: `Find tutors in ${decoded} on gurumates`,
    numberOfItems: tutors.length,
    itemListElement: tutors.slice(0, 10).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: t.name,
        jobTitle: "Tutor",
        url: `${SITE_URL}/tutors/${t.slug}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: decoded,
        },
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
      <h1 className="text-3xl font-bold">Tutors in {decoded}</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Home and online teachers near {decoded}. Compare rates and book lessons.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutors.map((t) => (
          <TutorCardView key={t.id} tutor={t} />
        ))}
      </div>
      {tutors.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No published tutors in {decoded} yet.</p>
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
