import { listTutors } from "@/lib/api";
import { TutorCardView } from "@/components/tutor-card";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  return { title: `Tutors in ${decodeURIComponent(city)}` };
}

export default async function LocationPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const decoded = decodeURIComponent(city);
  const tutors = await listTutors({ city: decoded }).catch(() => []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Tutors in {decoded}</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">Home and online teachers near {decoded}.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutors.map((t) => (
          <TutorCardView key={t.id} tutor={t} />
        ))}
      </div>
    </div>
  );
}
