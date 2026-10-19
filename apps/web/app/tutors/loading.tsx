export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="h-6 w-24 rounded bg-slate-200" />
          <div className="h-10 w-48 rounded bg-slate-200" />
          <div className="h-5 w-72 rounded bg-slate-200" />
        </div>
        <div className="h-11 w-44 rounded-xl bg-slate-200" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div className="h-11 w-full rounded-xl bg-slate-100" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-20 rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-36 rounded bg-slate-200" />
          <div className="h-6 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </section>
    </div>
  );
}
