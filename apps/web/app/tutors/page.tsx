import { Suspense } from "react";
import { listTutors } from "@/lib/api";
import { TutorCardView } from "@/components/tutor-card";
import { SearchBar } from "@/components/search-bar";
import { SearchTabs } from "@/components/search-tabs";

export const metadata = { title: "Find tutors" };

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const mode = typeof sp.mode === "string" ? sp.mode : undefined;
  const city = typeof sp.city === "string" ? sp.city : undefined;
  const subject = typeof sp.subject === "string" ? sp.subject : undefined;
  const tutors = await listTutors({ q, mode, city, subject }).catch(() => []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Find tutors</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Search any subject or skill — academics, languages, coding, music, and more.
      </p>
      <div className="mt-6 space-y-4">
        <SearchBar />
        <Suspense>
          <SearchTabs basePath="/tutors" />
        </Suspense>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutors.map((t) => (
          <TutorCardView key={t.id} tutor={t} />
        ))}
      </div>
      {tutors.length === 0 ? (
        <div className="mt-8 space-y-3 text-[rgb(var(--muted-foreground))]">
          <p>No exact matches. Try a broader subject or city.</p>
          <a href="/jobs/new" className="inline-flex font-semibold text-[rgb(var(--wtws-blue))]">
            Post a request
          </a>
        </div>
      ) : null}
    </div>
  );
}
