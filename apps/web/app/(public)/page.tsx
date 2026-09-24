import Image from 'next/image';
import Link from 'next/link';
import { PublicNav } from './components/PublicNav';
import { getGlobalOpportunities } from '../../lib/opportunities';

export default async function HomePage() {
  const opportunities = await getGlobalOpportunities();
  const realOpportunity = opportunities[0] ?? null;

  return (
    <div>
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden">
        <Image src="/hero-home.jpg" alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
        {/* Fixed dark overlay. No theme-flip concerns anymore since
            light/dark mode was removed — text-bone/text-muted/etc. now
            always resolve to their light-on-dark values regardless of
            what's behind them, so this needed no special-casing. */}
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative">
          <PublicNav />

          <section className="px-8 pt-16 pb-24 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-4">The university student platform</p>
            <h1 className="text-5xl leading-[1.1] text-bone mb-6">University life, all in one place.</h1>
            <p className="text-muted text-lg mb-8 max-w-md">
              Discover opportunities, stay on top of your academics, connect
              with your campus community, and find what matters to you.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/register" className="bg-gold text-ink px-6 py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors">
                Get Started
              </Link>
              <Link href="/discover" className="border border-border text-bone px-6 py-3 rounded-sm hover:border-gold/40 transition-colors">
                Explore CampusOS
              </Link>
            </div>
          </div>

          {/* Illustrative product preview — not live data, a mockup of
              what the dashboard looks like, same idea as a phone-store
              screenshot. Deliberately simple/static, not wired to real
              queries, since its purpose is to show the shape of the
              product on the marketing page, not to be functional here. */}
          <div className="bg-surface border border-border rounded-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-bone text-sm">CampusOS</span>
              <div className="flex items-center gap-2 flex-1 max-w-[180px] ml-4">
                <div className="flex-1 bg-ink border border-border rounded-sm px-2 py-1">
                  <span className="text-muted text-[10px]">Search anything...</span>
                </div>
                <BellIcon />
                <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[9px]">TE</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-bone text-sm">Good morning, Jisayo 👋</p>
                <p className="text-muted text-[10px]">Your campus. Your opportunities. Your future.</p>
              </div>
              <span className="text-[10px] text-gold border border-gold/30 rounded-full px-2 py-0.5">OAU</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <PreviewCard label="Upcoming class" title="Mathematical Methods II" subtitle="MTH 202 · 10:00 AM" tag="Lecture Hall B" />
              <PreviewCard label="Latest opportunity" title="Google STEP Internship 2026" subtitle="Tech · Remote · Paid" tag="Closes in 12 days" tagGold />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PreviewCard label="Community" title="OAU Coding Community" subtitle="1.2k members · 12 new posts" />
              <div className="bg-ink border border-border rounded-md p-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-muted text-[10px] uppercase tracking-wide">Campus status</p>
                </div>
                <p className="text-bone text-xs mb-1">OAU</p>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Library · Open
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Hostel · 70% occupancy
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>

      {/* ============ WHAT'S HAPPENING ============ */}
      <section className="px-8 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3">What's happening?</p>
              <h2 className="text-3xl text-bone">Opportunities, events and updates <span className="text-gold">for you.</span></h2>
              <p className="text-muted text-sm mt-2">Stay informed about the latest opportunities, events, and campus news tailored for students.</p>
            </div>
            <Link href="/opportunities" className="text-gold text-sm hover:text-gold-bright whitespace-nowrap">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {/* Real data — the one card actually backed by a live query. */}
            {realOpportunity ? (
              <UpdateCard
                image="/updates/opportunity.jpg"
                tag="Opportunity"
                title={realOpportunity.title}
                meta={realOpportunity.organization}
                detail={realOpportunity.deadline ? `Closes ${new Date(realOpportunity.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : undefined}
                href={`/opportunities/${realOpportunity.id}`}
              />
            ) : (
              <UpdateCard image="/updates/opportunity.jpg" tag="Opportunity" title="Check back soon" meta="New opportunities are added regularly" href="/opportunities" />
            )}

            {/* Illustrative examples — same category as the dashboard
                preview card: there's no real "events" or generic
                "community spotlight" data model yet, so these are
                static, not fabricated live data. */}
            <UpdateCard image="/updates/event.jpg" tag="Event" title="Campus Tech Workshop" meta="OAU · Student Union" detail="Sep 26, 2025 · 10:00 AM" href="/discover" />
            <UpdateCard image="/updates/academic.jpg" tag="Academic" title="MTH 202 Study Group" meta="Mathematical Methods II" detail="Sep 24, 2025 · 4:00 PM" href="/discover" />
            <UpdateCard image="/updates/community.jpg" tag="Community" title="OAU Devs Community" meta="1.2k members" detail="Build · Learn · Grow" href="/discover" />
          </div>
        </div>
      </section>

      {/* ============ SIX FEATURES + PHOTO ============ */}
      <section className="px-8 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto mb-14">
          <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3">Why CampusOS?</p>
          <h2 className="text-3xl text-bone mb-4">Everything you need for university life.</h2>
          <p className="text-muted max-w-xl">
            From academics to opportunities to community, CampusOS brings the
            important parts of student life together.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
          <div className="grid sm:grid-cols-2 gap-4">
            <PillarCard icon={<AcademicsIcon />} title="Academics" body="Courses, CGPA, resources, academic information." />
            <PillarCard icon={<OpportunitiesIcon />} title="Opportunities" body="Internships, jobs, scholarships, competitions." />
            <PillarCard icon={<CommunityIcon />} title="Community" body="Groups, discussions, student communities." />
            <PillarCard icon={<CampusIcon />} title="Campus" body="Events, notices, campus information." />
            <PillarCard icon={<MessagingIcon />} title="Messaging" body="1:1 and group communication." />
            <PillarCard icon={<ProjectsIcon />} title="Projects" body="Discover, share and collaborate on projects." />
          </div>
          <div className="relative rounded-md overflow-hidden min-h-[280px]">
            <Image src="/hero.jpg" alt="" fill unoptimized className="object-cover" />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-6">
              <p className="text-white text-sm mb-1">Built for every university.</p>
              <p className="text-white/70 text-xs">Designed for you, wherever you study.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ONE PLATFORM, EVERY UNIVERSITY ============ */}
      <section className="px-8 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <WorldMap />
          <div>
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3">Multi-university architecture</p>
            <h2 className="text-3xl text-bone mb-4">One platform. Every university.</h2>
            <p className="text-muted mb-8">
              CampusOS adapts to your institution while keeping the experience
              familiar wherever you study.
            </p>
            <div className="grid gap-5">
              <ArchPoint icon={<LockIcon />} title="University-specific data" body="School information is scoped to the relevant institution." />
              <ArchPoint icon={<CommunityIcon />} title="Shared public data" body="Opportunities, events and common resources are visible broadly." />
              <ArchPoint icon={<ShieldIcon />} title="Secure & flexible" body="Built for multiple universities with your privacy and security in mind." />
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="px-8 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3">Get started in 3 simple steps</p>
          <h2 className="text-3xl text-bone mb-4">How it works</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">
          <HowStep n="01" title="Choose your university" body="Select from the universities available on CampusOS." />
          <HowStep n="02" title="Create your profile" body="Tell us about your academic journey and interests." />
          <HowStep n="03" title="Get your personalized campus" body="Access the information, opportunities and communities that matter to you." />
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="px-8 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto bg-gold rounded-md px-10 py-14 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.15) 100%)' }}
          />
          <h2 className="text-3xl text-ink mb-2 relative">Your university life, more than lectures.</h2>
          <p className="text-ink/70 mb-8 relative">CampusOS brings the rest together.</p>
          <Link href="/auth/register" className="inline-block bg-ink text-bone px-8 py-4 rounded-sm font-medium hover:opacity-90 transition-opacity relative">
            Get Started →
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="px-8 py-12 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
            <div>
              <p className="font-display text-lg text-bone mb-1">CampusOS</p>
              <p className="text-muted text-sm">A digital operating system for university life.</p>
            </div>
            <div className="flex gap-10 text-sm">
              <Link href="/" className="text-muted hover:text-bone">Home</Link>
              <Link href="/features" className="text-muted hover:text-bone">Features</Link>
              <Link href="/about" className="text-muted hover:text-bone">About</Link>
              <Link href="/contact" className="text-muted hover:text-bone">Contact</Link>
            </div>
            <div className="flex gap-4">
              <SocialIcon><XIcon /></SocialIcon>
              <SocialIcon><InstagramIcon /></SocialIcon>
              <SocialIcon><YoutubeIcon /></SocialIcon>
              <SocialIcon><LinkedinIcon /></SocialIcon>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-2 pt-6 border-t border-border text-xs text-muted">
            <span>© {new Date().getFullYear()} CampusOS. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-bone">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-bone">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuickIcon({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold-bright shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm" style={{ color: '#F5F1E8' }}>{title}</p>
        <p className="text-xs" style={{ color: 'rgba(245,241,232,0.5)' }}>{subtitle}</p>
      </div>
    </div>
  );
}

function PreviewCard({ label, title, subtitle, tag, tagGold }: { label: string; title: string; subtitle: string; tag?: string; tagGold?: boolean }) {
  return (
    <div className="bg-ink border border-border rounded-md p-3">
      <div className="flex justify-between items-center mb-1">
        <p className="text-muted text-[10px] uppercase tracking-wide">{label}</p>
        <span className="text-muted text-[9px]">View all</span>
      </div>
      <p className="text-bone text-xs">{title}</p>
      <p className="text-muted text-[10px]">{subtitle}</p>
      {tag && <p className={`text-[10px] mt-0.5 ${tagGold ? 'text-gold' : 'text-muted'}`}>{tag}</p>}
    </div>
  );
}

function ArchPoint({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-bone text-sm mb-1">{title}</h3>
        <p className="text-muted text-xs leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// Stylized/abstract map — dotted grid + pins, not geographically precise
// cartography (that would need a real map dataset). Purely decorative,
// same illustrative category as the dashboard preview card.
function WorldMap() {
  const pins = [
    { x: 60, y: 90 }, { x: 110, y: 60 }, { x: 175, y: 75 }, { x: 200, y: 130 },
    { x: 260, y: 55 }, { x: 300, y: 110 },
  ];
  const dots = [];
  for (let x = 10; x < 340; x += 14) {
    for (let y = 10; y < 160; y += 14) {
      dots.push({ x, y });
    }
  }
  return (
    <svg viewBox="0 0 340 170" className="w-full h-auto text-gold/30">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1" fill="currentColor" />
      ))}
      {pins.map((p, i) => (
        <g key={i}>
          {i > 0 && (
            <line
              x1={pins[i - 1].x} y1={pins[i - 1].y} x2={p.x} y2={p.y}
              stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2"
            />
          )}
          <circle cx={p.x} cy={p.y} r="4" fill="#D9A441" />
          <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="#D9A441" strokeWidth="0.75" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function MessagingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  );
}

function PillarCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-bone text-sm mb-0.5">{title}</h3>
        <p className="text-muted text-xs">{body}</p>
      </div>
    </div>
  );
}

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-full bg-gold text-ink flex items-center justify-center text-sm font-medium mx-auto mb-4">
        {n}
      </div>
      <h3 className="text-bone mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function UpdateCard({
  image,
  tag,
  title,
  meta,
  detail,
  href,
}: {
  image: string;
  tag: string;
  title: string;
  meta: string;
  detail?: string;
  href: string;
}) {
  return (
    <Link href={href} className="block bg-surface border border-border rounded-md overflow-hidden hover:border-gold/40 transition-colors group">
      <div className="relative h-28 overflow-hidden">
        <Image src={image} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-110" />
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wide text-ink bg-gold px-2 py-1 rounded-sm font-medium">
          {tag}
        </span>
      </div>
      <div className="p-4">
        <p className="text-bone text-sm mb-1 leading-snug">{title}</p>
        <p className="text-muted text-xs mb-2">{meta}</p>
        <div className="flex items-center justify-between">
          {detail && <p className="text-muted text-xs">{detail}</p>}
          <span className="ml-auto w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted group-hover:text-gold group-hover:border-gold/40 transition-colors text-xs">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <a href="#" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-colors">
      {children}
    </a>
  );
}

function AcademicsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5" /></svg>;
}
function OpportunitiesIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="13" rx="1.5" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" /></svg>;
}
function CommunityIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="17" cy="8" r="2.3" opacity="0.6" /><path d="M16 14.2c2.9.5 5 2.6 5 5.8" opacity="0.6" /></svg>;
}
function CampusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" /></svg>;
}
function ProjectsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" /></svg>;
}
function LockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></svg>;
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Z" /></svg>;
}
function InstagramIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
function YoutubeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9v6l5-3-5-3Z" fill="currentColor" stroke="none" /></svg>;
}
function LinkedinIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7M7 7v.01M11 17v-4.5a2.5 2.5 0 0 1 5 0V17" /></svg>;
}
