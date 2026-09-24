'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STEPS = ['Account', 'University'] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', universityId: '' });

  useEffect(() => {
    fetch('/api/universities')
      .then((r) => r.json())
      .then(setUniversities)
      .catch(() => setError('Could not load universities. Refresh to try again.'));
  }, []);

  const isLast = step === STEPS.length - 1;

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setError(null);
    if (!form.universityId) {
      setError('Please select your university');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      router.push(data.redirectTo || '/dashboard');
      router.refresh();
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex gap-1 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-gold' : 'bg-border'}`} />
          ))}
        </div>
        <p className="text-xs text-muted mb-2">Step {step + 1} of {STEPS.length}</p>
        <h1 className="text-2xl text-bone mb-1">{STEPS[step]}</h1>
        <p className="text-muted text-sm mb-8">
          {step === 0 ? 'Join CampusOS and get started.' : '\u00A0'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <input
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
            <input
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            <input
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
              placeholder="Password (min. 8 characters)"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
        )}

        {step === 1 && (
          <select
            className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
            value={form.universityId}
            onChange={(e) => update('universityId', e.target.value)}
          >
            <option value="">Select your university</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 border border-border py-3 rounded-sm text-bone">
              Back
            </button>
          )}
          <button
            onClick={() => (isLast ? handleSubmit() : setStep((s) => s + 1))}
            disabled={loading || (step === 0 && (!form.name || !form.email || form.password.length < 8))}
            className="flex-1 bg-gold text-ink py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : isLast ? 'Create account' : 'Continue'}
          </button>
        </div>

        {step === 0 && (
          <p className="text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold-bright">Log in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
