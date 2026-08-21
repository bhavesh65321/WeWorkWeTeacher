import Link from "next/link";
import { SKILL_SUGGESTIONS } from "@wtws/shared";

export function HomeSkills({ live }: { live: string[] }) {
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const s of [...SKILL_SUGGESTIONS, ...live]) {
    const key = s.trim();
    if (!key) continue;
    const id = key.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    skills.push(key);
  }
  skills.sort((a, b) => a.localeCompare(b));

  return (
    <section>
      <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Top subjects and skills
      </h2>
      <p className="mx-auto mt-1 max-w-xl text-center text-sm text-[rgb(var(--muted-foreground))]">
        Academics, languages, coding, music, and more — tap a skill to find tutors.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        {skills.map((s) => (
          <Link
            key={s}
            href={`/subjects/${encodeURIComponent(s)}`}
            className="text-sm font-medium text-[rgb(var(--wtws-blue))] hover:underline"
          >
            {s}
          </Link>
        ))}
      </div>
    </section>
  );
}
