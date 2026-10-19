export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2 sm:space-y-3">
          <div className="h-5 w-20 rounded bg-slate-200" />
          <div className="h-9 w-56 rounded bg-slate-200" />
          <div className="h-5 w-72 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-slate-200 sm:h-11 sm:rounded-xl" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="h-10 w-full rounded-lg bg-slate-100 sm:h-11 sm:rounded-xl" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-16 rounded-lg bg-slate-100 sm:h-9 sm:w-20" />
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-1.5 sm:mb-4 sm:gap-2">
          <div className="h-5 w-28 rounded bg-slate-200 sm:h-6 sm:w-36" />
          <div className="h-5 w-12 rounded-full bg-slate-100 sm:h-6 sm:w-16" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200 sm:h-32 sm:rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
