export default function CommunityLoading() {
  return (
    <div className="max-w-2xl animate-pulse">
      <div className="h-8 w-40 bg-surface rounded-sm mb-2" />
      <div className="h-4 w-64 bg-surface rounded-sm mb-6" />
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-surface rounded-full" />
        ))}
      </div>
      <div className="h-24 bg-surface border border-border rounded-md mb-8" />
      <div className="grid gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-surface border border-border rounded-md" />
        ))}
      </div>
    </div>
  );
}
