'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell, inputClass } from '../components/AuthShell';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // TODO: Connect this form to the registration API.
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
        {/* Full name */}
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
            autoComplete="name"
            required
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
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
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
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Create a strong password"
              className={`${inputClass} pr-20`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-gold transition-colors"
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
              autoComplete="new-password"
              required
              placeholder="Re-enter your password"
              className={`${inputClass} pr-20`}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-gold transition-colors"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 pt-1">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-gold"
          />

          <label htmlFor="terms" className="text-xs leading-5 text-muted">
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-gold text-black font-semibold py-3.5 hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/60 transition-all"
        >
          Create account
        </button>
      </form>

      {/* Login */}
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
