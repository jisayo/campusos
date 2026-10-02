'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell, inputClass } from '../components/AuthShell';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    universityId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!form.universityId) {
      setError('Please select your university.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          universityId: form.universityId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to create account.');
        return;
      }

      router.push(data.redirectTo || '/auth/verify-sent');
    } catch {
      setError(
        'Unable to connect to CampusOS. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <p className="text-gold text-sm font-medium tracking-wide uppercase mb-2">
          Get started
        </p>

        <h1 className="font-display text-3xl sm:text-4xl text-bone">
          Create your account
        </h1>

        <p className="text-muted mt-2 text-sm">
          Join CampusOS and bring your university life together.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm text-bone/80 mb-2"
          >
            Full name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter your full name"
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm text-bone/80 mb-2"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        {/* University */}
        <div>
          <label
            htmlFor="university"
            className="block text-sm text-bone/80 mb-2"
          >
            University
          </label>

          <select
            id="university"
            name="university"
            required
            value={form.universityId}
            onChange={(e) =>
              updateField('universityId', e.target.value)
            }
            className={`${inputClass} appearance-none`}
          >
            <option value="">Select your university</option>

            {/* Replace these with IDs from your universities table */}
            <option value="00000000-0000-0000-0000-000000000001">
              Obafemi Awolowo University
            </option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm text-bone/80 mb-2"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                updateField('password', e.target.value)
              }
              placeholder="Create a strong password"
              className={`${inputClass} pr-20`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-gold"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <p className="text-xs text-muted/70 mt-2">
            Use at least 8 characters.
          </p>
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm text-bone/80 mb-2"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) =>
                updateField('confirmPassword', e.target.value)
              }
              placeholder="Re-enter your password"
              className={`${inputClass} pr-20`}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((value) => !value)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-gold"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Terms */}
        <div className="flex items-start gap-3 pt-1">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-gold"
          />

          <label
            htmlFor="terms"
            className="text-xs leading-5 text-muted"
          >
            I agree to the CampusOS{' '}
            <Link
              href="/terms"
              className="text-gold hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-gold hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {/* Create account */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold text-black font-semibold py-3.5 hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-7 pt-6 border-t border-gold/15 text-center">
        <p className="text-sm text-muted">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-gold font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
