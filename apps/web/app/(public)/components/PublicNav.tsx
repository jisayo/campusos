import Link from 'next/link';

const links = [
  { href: '/discover', label: 'Discover' },
  { href: '/universities', label: 'Universities' },
  { href: '/features', label: 'Features' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function PublicNav() {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-border">
      <Link href="/" className="font-display text-lg text-bone">
        CampusOS
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-bone transition-colors">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <button aria-label="Search" className="w-8 h-8 flex items-center justify-center text-muted hover:text-bone transition-colors">
          <SearchIcon />
        </button>
        <Link href="/auth/login" className="text-sm text-bone border border-border rounded-sm px-4 py-2 hover:border-gold/40 transition-colors">
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="text-sm bg-gold text-ink px-4 py-2 rounded-sm font-medium hover:bg-gold-bright transition-colors"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
