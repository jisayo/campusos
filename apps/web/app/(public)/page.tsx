import Image from 'next/image';
import Link from 'next/link';
import { PublicNav } from './components/PublicNav';
import { getGlobalOpportunities } from '../../lib/opportunities';

// Shared wide container: max-w-7xl with responsive horizontal padding.
const CONTAINER = 'max-w-7xl mx-auto px-6 sm:px-8 lg:px-12';
const EYEBROW = 'text-gold text-xs tracking-[0.2em] uppercase mb-3';
const H2 = 'text-3xl sm:text-4xl lg:text-[42px] leading-[1.15] text-bone';

export default async function HomePage() {
  const opportunities = await getGlobalOpportunities();
  const realOpportunity = opportunities[0] ?? null;

  return (
    <div>
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden">
        <Image src="/hero-home.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative">
          <PublicNav />
          <section className={`${CONTAINER} pt-16 pb-20 lg:pt-24 lg:pb-28 lg:min-h-[640px] grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center`}>
            <div>
              <p className={EYEBROW + ' mb-5'}>The university student platform</p>
              <h1 className="text-[40px] sm:text-[46px] lg:text-[64px] leading-[1.05] text-bone mb-6">
                University life, all in one place.
              </h1>
              <p className="text-muted text-base sm:text-lg lg:text-[19px] leading-relaxed mb-9 max-w-lg">
                Discover opportunities, stay on top of your academics, connect
                with your campus community, and find what matters to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/auth/register"
                  className="bg-gold text-ink px-8 py-4 rounded-md text-[15px] font-medium text-center hover:bg-gold-bright hover:-translate-y-0.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright"
                >
                  Get Started
                </Link>
                <Link
                  href="/discover"
                  className="border border-border bg-white/[0.03] text-bone px-8 py-4 rounded-md text-[15px] text-center hover:border-gold/50 hover:bg-white/[0.06] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright"
                >
                  Explore CampusOS
                </Link>
              </div>
            </div>
            <DashboardPreview />
          </section>
        </div>
      </div>

      {/* ============ WHAT'S HAPPENING ============ */}
      <section className="py-20 lg:py-24 border-t border-border">
        <div className={CONTAINER}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 lg:mb-12">
            <div className="max-w-2xl">
              <p className={EYEBROW}>What's happening?</p>
              <h2 className={H2}>
                Opportunities, events and updates <span className="text-gold">for you.</span>
              </h2>
              <p className="text-muted text-base mt-3">
                Stay informed about the latest opportunities, events, and campus news tailored for students.
              </p>
            </div>
            <Link href="/opportunities" className="text-gold text-sm hover:text-gold-bright whitespace-nowrap">
              View all →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pb-3 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5">
            {realOpportunity ? (
              <UpdateCard
                image="/updates/opportunity.webp"
                tag="Opportunity"
                title={realOpportunity.title}
                meta={realOpportunity.organization}
                detail={realOpportunity.deadline ? `Closes ${new Date(realOpportunity.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : undefined}
                href={`/opportunities/${realOpportunity.id}`}
              />
            ) : (
              <UpdateCard image="/updates/opportunity.webp" tag="Opportunity" title="Check back soon" meta="New opportunities are added regularly" href="/opportunities" />
            )}
            <UpdateCard image="/updates/event.webp" tag="Event" title="Campus Tech Workshop" meta="OAU · Student Union" detail="Sep 26, 2025 · 10:00 AM" href="/discover" />
            <UpdateCard image="/updates/academic.webp" tag="Academic" title="MTH 202 Study Group" meta="Mathematical Methods II" detail="Sep 24, 2025 · 4:00 PM" href="/discover" />
            <UpdateCard image="/updates/community.webp" tag="Community" title="OAU Devs Community" meta="1.2k members" detail="Build · Learn · Grow" href="/discover" />
          </div>
        </div>
      </section>

      {/* ============ SIX FEATURES + PHOTO ============ */}
      <section className="py-20 lg:py-24 border-t border-border">
        <div className={`${CONTAINER} mb-12 lg:mb-14`}>
          <p className={EYEBROW}>Why CampusOS?</p>
          <h2 className={`${H2} mb-4`}>Everything you need for university life.</h2>
          <p className="text-muted text-base lg:text-lg max-w-xl">
            From academics to opportunities to community, CampusOS brings the
            important parts of student life together.
          </p>
        </div>
        <div className={`${CONTAINER} grid lg:grid-cols-[1.25fr_1fr] gap-6 items-stretch`}>
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
            <PillarCard icon={<AcademicsIcon />} title="Academics" body="Courses, CGPA, resources and academic information." />
            <PillarCard icon={<OpportunitiesIcon />} title="Opportunities" body="Internships, jobs, scholarships and competitions." />
            <PillarCard icon={<CommunityIcon />} title="Community" body="Groups, discussions and student communities." />
            <PillarCard icon={<CampusIcon />} title="Campus" body="Events, notices and campus information." />
            <PillarCard icon={<MessagingIcon />} title="Messaging" body="1:1 and group communication." />
            <PillarCard icon={<ProjectsIcon />} title="Projects" body="Discover, share and collaborate on projects." />
          </div>
          <div className="relative rounded-xl overflow-hidden min-h-[320px] lg:min-h-full border border-border">
            <Image src="/hero.webp" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-7">
              <p className="text-white text-lg mb-1">Built for every university.</p>
              <p className="text-white/70 text-sm">Designed for you, wherever you study.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ONE PLATFORM, EVERY UNIVERSITY ============ */}
      <section className="py-24 lg:py-28 border-t border-border">
        <div className={CONTAINER}>
          <div className="relative rounded-2xl border border-border bg-surface/60 overflow-hidden p-6 sm:p-10 lg:p-14 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(60% 70% at 25% 50%, rgba(217,164,65,0.10), transparent 70%)' }}
            />
            <div className="relative">
              <WorldMap />
            </div>
            <div className="relative">
              <p className={EYEBROW}>Multi-university architecture</p>
              <h2 className={`${H2} mb-4`}>One platform. Every university.</h2>
              <p className="text-muted text-base lg:text-lg mb-8">
                CampusOS adapts to your institution while keeping the experience
                familiar wherever you study.
              </p>
              <div className="grid gap-6">
                <ArchPoint icon={<LockIcon />} title="University-specific data" body="School information is scoped to the relevant institution." />
                <ArchPoint icon={<CommunityIcon />} title="Shared public data" body="Opportunities, events and common resources are visible broadly." />
                <ArchPoint icon={<ShieldIcon />} title="Secure & flexible" body="Built for multiple universities with your privacy and security in mind." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 lg:py-24 border-t border-border">
        <div className={`${CONTAINER} text-center mb-14`}>
          <p className={EYEBROW}>Get started in 3 simple steps</p>
          <h2 className={H2}>How it works</h2>
        </div>
        <div className={`${CONTAINER} relative`}>
          <div className="hidden md:block absolute left-[16.6%] right-[16.6%] top-7 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="relative grid md:grid-cols-3 gap-12 md:gap-8">
            <HowStep n="01" title="Choose your university" body="Select from the universities available on CampusOS." />
            <HowStep n="02" title="Create your profile" body="Tell us about your academic journey and interests." />
            <HowStep n="03" title="Get your personalized campus" body="Access the information, opportunities and communities that matter to you." />
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 lg:py-24 border-t border-border">
        <div className={CONTAINER}>
          <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-surface px-6 py-12 sm:px-12 sm:py-14 lg:py-16 text-center">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(70% 90% at 50% 0%, rgba(217,164,65,0.16), transparent 70%)' }}
            />
            <h2 className="relative text-3xl sm:text-4xl text-bone mb-3">Your university life, more than lectures.</h2>
            <p className="relative text-muted text-base lg:text-lg mb-8">CampusOS brings the rest together.</p>
            <Link
              href="/auth/register"
              className="relative inline-block bg-gold text-ink px-8 py-4 rounded-md text-[15px] font-medium hover:bg-gold-bright hover:-translate-y-0.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 border-t border-border">
        <div className={CONTAINER}>
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
            <div>
              <p className="font-display text-xl text-bone mb-1">CampusOS</p>
              <p className="text-muted text-sm">A digital operating system for university life.</p>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
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

/* ================= COMPONENTS ================= */

// Illustrative product preview, not live data. Static on purpose.
function DashboardPreview() {
  const nav = ['Dashboard', 'Opportunities', 'Academics', 'Community', 'Campus', 'Messages', 'Projects'];
  return (
    <div className="group w-full lg:max-w-[600px] lg:ml-auto rounded-2xl border-2 border-white/10 bg-surface/80 backdrop-blur-md shadow-[0_30px_80px_-25px_rgba(0,0,0,0.9)] overflow-hidden flex transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_40px_90px_-25px_rgba(217,164,65,0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <aside className="hidden sm:flex flex-col w-44 shrink-0 border-r border-border p-4 gap-1">
        <span className="font-display text-bone text-lg mb-5 px-2">CampusOS</span>
        {nav.map((item, i) => (
          <div
            key={item}
            className={`text-[13px] px-3 py-2 rounded-md ${i === 0 ? 'bg-gold/10 text-gold border border-gold/20' : 'text-muted'}`}
          >
            {item}
          </div>
        ))}
      </aside>
      <div className="flex-1 min-w-0 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex-1 max-w-[220px] bg-ink border border-border rounded-md px-3 py-2">
            <span className="text-muted text-xs">Search anything...</span>
          </div>
          <div className="flex items-center gap-3">
            <BellIcon />
            <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[10px]">JA</div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-bone text-lg">Good morning, Jisayo 👋</p>
            <p className="text-muted text-xs mt-0.5">Your campus. Your opportunities. Your future.</p>
          </div>
          <span className="text-xs text-gold border border-gold/30 rounded-full px-2.5 py-0.5">OAU</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <PreviewCard label="Upcoming class" title="Mathematical Methods II" subtitle="MTH 202 · 10:00 AM" tag="Lecture Hall B" />
          <PreviewCard label="Latest opportunity" title="Google STEP Internship 2026" subtitle="Tech · Remote · Paid" tag="Closes in 12 days" tagGold />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PreviewCard label="Community" title="OAU Coding Community" subtitle="1.2k members · 12 new posts" />
          <div className="bg-ink border border-border rounded-lg p-4">
            <p className="text-muted text-[11px] uppercase tracking-wide mb-2">Campus status</p>
            <p className="text-bone text-sm mb-2">OAU</p>
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Library · Open
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Hostel · 70% occupancy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ label, title, subtitle, tag, tagGold }: { label: string; title: string; subtitle: string; tag?: string; tagGold?: boolean }) {
  return (
    <div className="bg-ink border border-border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-muted text-[11px] uppercase tracking-wide">{label}</p>
        <span className="text-muted text-[10px]">View all</span>
      </div>
      <p className="text-bone text-sm leading-snug">{title}</p>
      <p className="text-muted text-xs mt-0.5">{subtitle}</p>
      {tag && <p className={`text-xs mt-1.5 ${tagGold ? 'text-gold' : 'text-muted'}`}>{tag}</p>}
    </div>
  );
}

function ArchPoint({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-bone text-base mb-1">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// Stylized/abstract map: dotted grid + pins, not geographically precise.
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
    <svg viewBox="0 0 340 170" className="w-full h-auto text-gold/30" role="img" aria-label="Map showing universities connected on one platform">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1.2" fill="currentColor" />
      ))}
      {pins.map((p, i) => (
        <g key={i}>
          {i > 0 && (
            <line
              x1={pins[i - 1].x} y1={pins[i - 1].y} x2={p.x} y2={p.y}
              stroke="currentColor" strokeWidth="0.7" strokeDasharray="3,2"
            />
          )}
          <circle cx={p.x} cy={p.y} r="4.5" fill="#D9A441" />
          <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#D9A441" strokeWidth="0.75" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted shrink-0">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function MessagingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  );
}

function PillarCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group flex flex-col justify-between min-h-[190px] bg-surface border border-border rounded-xl p-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-gold/50 hover:bg-white/[0.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-5">
        {icon}
      </div>
      <div>
        <h3 className="text-bone text-lg mb-1.5">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{body}</p>
      </div>
      <span className="self-end mt-3 text-muted group-hover:text-gold transition-colors text-sm" aria-hidden="true">→</span>
    </div>
  );
}

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center text-lg font-medium mx-auto mb-6 ring-8 ring-ink relative">
        {n}
      </div>
      <h3 className="text-bone text-xl mb-3">{title}</h3>
      <p className="text-muted text-base leading-relaxed max-w-xs mx-auto">{body}</p>
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
    <Link
      href={href}
      className="block shrink-0 snap-start w-[78%] sm:w-[46%] md:w-auto bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 group motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative h-44 lg:h-48 overflow-hidden">
        <Image src={image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 78vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
        <span className="absolute top-3 left-3 text-[11px] uppercase tracking-wide text-ink bg-gold px-2.5 py-1 rounded-sm font-medium">
          {tag}
        </span>
      </div>
      <div className="p-5">
        <p className="text-bone text-base mb-1 leading-snug">{title}</p>
        <p className="text-muted text-sm mb-3">{meta}</p>
        <div className="flex items-center justify-between">
          {detail && <p className="text-muted text-xs">{detail}</p>}
          <span className="ml-auto w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted group-hover:text-gold group-hover:border-gold/40 transition-colors text-xs" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <a href="#" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-gold hover:border-gold/40 transition-colors">
      {children}
    </a>
  );
}

function AcademicsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5" /></svg>;
}
function OpportunitiesIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="13" rx="1.5" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" /></svg>;
}
function CommunityIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="17" cy="8" r="2.3" opacity="0.6" /><path d="M16 14.2c2.9.5 5 2.6 5 5.8" opacity="0.6" /></svg>;
}
function CampusIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" /></svg>;
}
function ProjectsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" /></svg>;
}
function LockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}
function ShieldIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></svg>;
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
