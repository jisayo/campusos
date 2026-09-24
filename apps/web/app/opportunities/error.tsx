'use client';

export default function OpportunitiesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto px-8 py-12">
      <h2 className="text-bone text-xl mb-2">Couldn't load opportunities</h2>
      <p className="text-muted text-sm mb-6">Something went wrong. This is usually temporary.</p>
      <button
        onClick={reset}
        className="bg-gold text-ink px-5 py-2.5 rounded-sm font-medium hover:bg-gold-bright transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
