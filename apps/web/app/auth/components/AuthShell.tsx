import Image from 'next/image';
import Link from 'next/link';

// Swap this for a library/campus photo, e.g. '/auth-bg.webp' (put it in apps/web/public).
const AUTH_BG = '/hero-home.webp';

export const inputClass =
  'w-full bg-[#14181f]/80 border border-gold/30 rounded-lg px-4 py-3.5 text-bone placeholder:text-muted/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image src={AUTH_BG} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

      <div className="relative min-h-screen flex flex-col px-6 sm:px-10 lg:px-16 py-8">
        <Logo />

        <div className="flex-1 grid lg:grid-cols-2 gap-12 items-center py-10">
          <div className="hidden lg:block">
            <p className="font-display text-6xl leading-[1.08] text-bone mb-5">
              University life,
              <br />
              <span className="text-gold">all in one place.</span>
            </p>
            <p className="text-bone/80 text-lg max-w-sm">
              Opportunities, academics and your campus community, together.
            </p>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-2xl border border-gold/40 bg-gradient-to-br from-[#4a3a22]/60 via-[#2b2418]/75 to-[#1c1810]/85 backdrop-blur-xl p-7 sm:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 text-gold self-start">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3 2 8l10 5 10-5-10-5Z" />
        <path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5" />
      </svg>
      <span className="font-display text-lg text-bone">CampusOS</span>
    </Link>
  );
}
