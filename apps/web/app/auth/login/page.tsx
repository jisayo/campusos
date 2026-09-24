'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      router.push(data.redirectTo || '/dashboard');
      router.refresh(); // ensures Server Components re-read the new session cookie
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl text-bone mb-1">Welcome back.</h1>
        <p className="text-muted text-sm mb-8">Log in to your CampusOS account</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm text-muted block mb-1">Email</label>
            <input
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Password</label>
            <input
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" /> Remember me
            </label>
            <Link href="/auth/forgot-password" className="text-gold hover:text-gold-bright">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-ink py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted text-xs">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Visual only — not wired to real Google OAuth. Shown to match
            the reference design; clicking it currently does nothing real.
            Wire this up (or remove it) before this is a real deliverable. */}
        <button
          type="button"
          disabled
          title="Not yet implemented"
          className="w-full border border-border text-bone py-3 rounded-sm hover:border-gold/40 transition-colors flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-sm text-muted mt-6">
          New here?{' '}
          <Link href="/auth/register" className="text-gold hover:text-gold-bright">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.05l3.66 2.85c.87-2.6 3.3-4.52 6.16-4.52Z" />
    </svg>
  );
}
