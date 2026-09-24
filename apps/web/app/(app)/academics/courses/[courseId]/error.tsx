'use client';

export default function CourseError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md">
      <h2 className="text-bone text-xl mb-2">Couldn't load this course</h2>
      <p className="text-muted text-sm mb-6">Something went wrong. Try again in a moment.</p>
      <button
        onClick={reset}
        className="bg-gold text-ink px-5 py-2.5 rounded-sm font-medium hover:bg-gold-bright transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
