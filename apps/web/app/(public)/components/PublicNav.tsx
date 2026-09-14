import Link from 'next/link';

const links = [
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/discover', label: 'Opportunities' },
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
        <Link href="/auth/login" className="text-sm text-bone hover:text-gold transition-colors">
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
