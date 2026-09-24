export default function CourseDetailLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-4 w-24 bg-surface rounded-sm mb-6" />
      <div className="h-8 w-72 bg-surface rounded-sm mb-2" />
      <div className="h-4 w-96 bg-surface rounded-sm mb-10" />
      <div className="h-6 w-28 bg-surface rounded-sm mb-4" />
      <div className="grid gap-3 mb-10">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-14 bg-surface border border-border rounded-md" />
        ))}
      </div>
      <div className="h-6 w-32 bg-surface rounded-sm mb-4" />
      <div className="grid gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 bg-surface border border-border rounded-md" />
        ))}
      </div>
    </div>
  );
}
