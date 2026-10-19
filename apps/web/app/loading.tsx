export default function Loading() {
  return (
    <div className="animate-pulse space-y-10 sm:space-y-14">
      <section className="rounded-3xl bg-slate-200 px-6 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <div className="mx-auto h-12 w-3/4 rounded-lg bg-slate-300" />
          <div className="mx-auto h-6 w-2/3 rounded bg-slate-300" />
          <div className="mx-auto h-12 w-full max-w-xl rounded-xl bg-slate-300" />
          <div className="flex justify-center gap-3">
            <div className="h-12 w-40 rounded-xl bg-slate-300" />
            <div className="h-12 w-32 rounded-xl bg-slate-300" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-200" />
        ))}
      </section>
    </div>
  );
}
