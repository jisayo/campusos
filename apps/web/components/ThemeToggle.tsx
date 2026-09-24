'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle({ onPhoto = false }: { onPhoto?: boolean }) {
  // Start null so we render nothing until mounted — avoids a
  // server/client mismatch, since the server can't know localStorage.
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as 'dark' | 'light') || 'dark');
  }, []);

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('campusos-theme', next);
  }

  if (!theme) return <div className="w-8 h-8" />; // reserve space, avoid layout shift

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
        onPhoto ? 'hover:opacity-80' : 'border-border text-muted hover:text-gold hover:border-gold/40'
      }`}
      style={onPhoto ? { borderColor: 'rgba(245,241,232,0.3)', color: '#F5F1E8' } : undefined}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}
