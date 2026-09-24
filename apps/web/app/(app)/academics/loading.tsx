export default function AcademicsLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-8 w-40 bg-surface rounded-sm mb-2" />
      <div className="h-4 w-64 bg-surface rounded-sm mb-8" />
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-surface border border-border rounded-md" />
        ))}
      </div>
      <div className="h-6 w-32 bg-surface rounded-sm mb-4" />
      <div className="grid gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-surface border border-border rounded-md" />
        ))}
      </div>
    </div>
  );
}
