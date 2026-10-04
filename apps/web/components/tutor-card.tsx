import Link from "next/link";
import { MODE_LABELS, type TutorCard } from "@wtws/shared";
import { formatTutorFee } from "@/lib/money";
import { TutorAvatar } from "@/components/tutor-avatar";
import { VerifiedBadge } from "@/components/verified-badge";

export function TutorCardView({ tutor }: { tutor: TutorCard }) {
  return (
    <Link 
      href={`/tutors/${tutor.slug}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <TutorAvatar name={tutor.name} photoUrl={tutor.photoUrl} className="h-14 w-14 text-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900">{tutor.name}</h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{tutor.headline}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-[rgb(var(--wtws-blue))]">
                {formatTutorFee(tutor.rateType, tutor.hourlyRateMinor, tutor.hourlyRateMaxMinor, tutor.currency)}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {s}
              </span>
            ))}
            {tutor.modes.slice(0, 2).map((m) => (
              <span key={m} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {MODE_LABELS[m]}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {tutor.city ? `${tutor.city}, ${tutor.country}` : tutor.timezone}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {tutor.ratingAvg.toFixed(1)} ({tutor.reviewCount})
            </span>
            {(tutor.emailVerified || tutor.phoneVerified) && (
              <div className="ml-auto flex gap-1">
                {tutor.emailVerified && <VerifiedBadge type="email" />}
                {tutor.phoneVerified && <VerifiedBadge type="phone" />}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
