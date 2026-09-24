import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/discover', label: 'Discover' },
  { href: '/academics', label: 'Academics' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/community', label: 'Community' },
  { href: '/campus', label: 'Campus' },
  { href: '/messages', label: 'Messages' },
  { href: '/projects', label: 'Projects' },
];

// Plain component, not a route-group layout.tsx — this is deliberate.
// A few routes (like /opportunities) need the exact same shell for
// logged-in users but must also work, unwrapped, for logged-out
// visitors on the same URL, which route-group layouts can't express.
// Both app/(app)/layout.tsx and those hybrid pages import this directly.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 border-r border-border p-6 gap-1">
        <Link href="/dashboard" className="font-display text-lg text-bone mb-8">
          CampusOS
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-muted hover:text-bone hover:bg-surface rounded-sm px-3 py-2 transition-colors"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-auto">
          <Link href="/settings" className="text-sm text-muted hover:text-bone rounded-sm px-3 py-2 block">
            Settings
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <input
            className="bg-surface border border-border rounded-sm px-4 py-2 text-sm text-bone w-72"
            placeholder="Search anything..."
          />
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="text-muted hover:text-bone">
              Notifications
            </Link>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-surface border border-border" />
          </div>
        </header>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-ink flex justify-around py-2">
          {NAV.slice(0, 5).map((item) => (
            <Link key={item.href} href={item.href} className="text-xs text-muted">
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
