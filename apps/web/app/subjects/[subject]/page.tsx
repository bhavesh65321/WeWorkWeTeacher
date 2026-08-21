import { listTutors } from "@/lib/api";
import { TutorCardView } from "@/components/tutor-card";

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);
  return { title: `${decoded} tutors` };
}

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);
  const tutors = await listTutors({ subject: decoded }).catch(() => []);

  return (
    <div>
      <h1 className="text-3xl font-bold">{decoded} tutors</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">Teachers for {decoded} — online and in person.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutors.map((t) => (
          <TutorCardView key={t.id} tutor={t} />
        ))}
      </div>
      {tutors.length === 0 ? <p className="mt-8">No published tutors for this subject yet.</p> : null}
    </div>
  );
}
