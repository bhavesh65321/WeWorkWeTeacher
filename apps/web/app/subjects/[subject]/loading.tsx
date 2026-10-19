export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-2 h-4 w-32 rounded bg-slate-200" />
      <div className="h-10 w-48 rounded bg-slate-200" />
      <div className="mt-2 h-5 w-72 rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
