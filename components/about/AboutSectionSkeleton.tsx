export function AboutSectionSkeleton() {
  return (
    <section className="mb-20 px-4 sm:px-6">
      <div className="text-center mb-12 animate-pulse">
        <div className="h-10 bg-slate-800/50 rounded w-64 mx-auto mb-4"></div>
        <div className="h-6 bg-slate-800/30 rounded w-96 mx-auto"></div>
      </div>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-32 bg-slate-800/30 rounded-xl animate-pulse"></div>
        <div className="h-32 bg-slate-800/30 rounded-xl animate-pulse"></div>
      </div>
    </section>
  );
}
