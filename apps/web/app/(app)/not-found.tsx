import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md">
      <h1 className="text-3xl text-bone mb-2">Not found</h1>
      <p className="text-muted mb-6">
        This page doesn't exist, or you don't have access to it.
      </p>
      <Link href="/dashboard" className="text-gold hover:text-gold-bright text-sm">
        ← Back to dashboard
      </Link>
    </div>
  );
}
