'use client';

import { useState } from 'react';
import Link from 'next/link';

const STEPS = ['Account', 'University', 'Faculty', 'Department', 'Programme', 'Level'] as const;

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    universityId: '',
    facultyId: '',
    departmentId: '',
    programmeId: '',
    levelId: '',
  });

  const isLast = step === STEPS.length - 1;

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    // POST /api/auth/register with `form`, then route to /auth/verify.
    // Left as a stub — wire up once the register API route exists.
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Progress indicator — brief §7: user should see steps remaining */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-gold' : 'bg-border'}`}
            />
          ))}
        </div>
        <p className="text-xs text-muted mb-2">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="text-2xl text-bone mb-8">{STEPS[step]}</h1>

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
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
        )}

        {step === 1 && (
          <SelectStep
            placeholder="Select your university"
            value={form.universityId}
            onChange={(v) => update('universityId', v)}
          />
        )}
        {step === 2 && (
          <SelectStep
            placeholder="Select your faculty"
            value={form.facultyId}
            onChange={(v) => update('facultyId', v)}
          />
        )}
        {step === 3 && (
          <SelectStep
            placeholder="Select your department"
            value={form.departmentId}
            onChange={(v) => update('departmentId', v)}
          />
        )}
        {step === 4 && (
          <SelectStep
            placeholder="Select your programme"
            value={form.programmeId}
            onChange={(v) => update('programmeId', v)}
          />
        )}
        {step === 5 && (
          <SelectStep
            placeholder="Select your level"
            value={form.levelId}
            onChange={(v) => update('levelId', v)}
          />
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 border border-border py-3 rounded-sm text-bone"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (isLast ? handleSubmit() : setStep((s) => s + 1))}
            className="flex-1 bg-gold text-ink py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors"
          >
            {isLast ? 'Create account' : 'Continue'}
          </button>
        </div>

        {step === 0 && (
          <p className="text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold-bright">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

// Placeholder select — real version fetches options scoped to the previous
// step's choice (e.g. departments filtered by selected faculty) from the
// org_nodes table.
function SelectStep({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
    </select>
  );
}
