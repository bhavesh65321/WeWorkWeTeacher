export default function Loading() {
  return (
    <div className="grid min-w-0 animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-20 w-20 rounded-full bg-slate-200" />
          <div className="min-w-0 space-y-2">
            <div className="h-9 w-48 rounded bg-slate-200" />
            <div className="h-6 w-64 rounded bg-slate-200" />
            <div className="h-4 w-40 rounded bg-slate-200" />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="min-w-0 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-8 w-32 rounded bg-slate-200" />
          <div className="mt-4 h-11 w-full rounded-xl bg-slate-200" />
          <div className="mt-2 h-11 w-full rounded-xl bg-slate-100" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-5 w-24 rounded bg-slate-200" />
          <div className="mt-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
