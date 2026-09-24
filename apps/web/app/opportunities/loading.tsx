export default function OpportunitiesLoading() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12 animate-pulse">
      <div className="h-8 w-48 bg-surface rounded-sm mb-2" />
      <div className="h-4 w-96 bg-surface rounded-sm mb-8" />
      <div className="grid gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-surface border border-border rounded-md" />
        ))}
      </div>
    </div>
  );
}
