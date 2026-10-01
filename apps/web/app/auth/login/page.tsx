'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell, inputClass } from '../components/AuthShell';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
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
    <AuthShell>
      <h1 className="font-display text-4xl text-bone mb-2">
        Welcome <span className="text-gold">back.</span>
      </h1>
      <p className="text-muted text-sm mb-8">Log in to your CampusOS account</p>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-3">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="text-sm text-bone/80 block mb-1.5">Email</label>
          <input
            id="email"
            className={inputClass}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-bone/80 block mb-1.5">Password</label>
          <div className="relative">
            <input
              id="password"
              className={`${inputClass} pr-16`}
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-gold"
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="accent-[#D9A441]" /> Remember me
          </label>
          <Link href="/auth/forgot-password" className="text-gold hover:text-gold-bright">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#b8893a] via-[#e0b560] to-[#b8893a] text-ink py-3.5 rounded-lg font-medium hover:brightness-110 transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-muted mt-8">
        New here?{' '}
        <Link href="/auth/register" className="text-gold hover:text-gold-bright">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
