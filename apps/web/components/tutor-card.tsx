import Link from "next/link";
import { Badge, Card } from "@wtws/ui";
import { MODE_LABELS, type TutorCard } from "@wtws/shared";
import { formatTutorFee } from "@/lib/money";
import { TutorAvatar } from "@/components/tutor-avatar";

export function TutorCardView({ tutor }: { tutor: TutorCard }) {
  return (
    <Link href={`/tutors/${tutor.slug}`}>
      <Card className="h-full transition hover:border-[rgb(var(--wtws-blue))] hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <TutorAvatar name={tutor.name} photoUrl={tutor.photoUrl} className="h-12 w-12 text-sm" />
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{tutor.name}</h3>
              <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{tutor.headline}</p>
            </div>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold text-[rgb(var(--wtws-blue))]">
            {formatTutorFee(tutor.rateType, tutor.hourlyRateMinor, tutor.hourlyRateMaxMinor, tutor.currency)}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 3).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
          {tutor.modes.slice(0, 2).map((m) => (
            <Badge key={m}>{MODE_LABELS[m]}</Badge>
          ))}
        </div>
        <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
          {tutor.city ? `${tutor.city}, ${tutor.country}` : tutor.timezone} · {tutor.ratingAvg.toFixed(1)} ({tutor.reviewCount})
        </p>
      </Card>
    </Link>
  );
}
