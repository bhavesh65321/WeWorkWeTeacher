export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-5 w-64 rounded bg-slate-200" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full h-40 rounded-2xl bg-slate-200 lg:col-span-2" />
        <div className="h-40 rounded-2xl bg-slate-200" />
      </div>

      <div className="mt-6 space-y-4">
        <div className="h-6 w-32 rounded bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
