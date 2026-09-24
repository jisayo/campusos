import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthContext } from '../../../lib/authz';
import { getMyCourses, getGpaSummary } from '../../../lib/academics';
import { getGlobalOpportunities, getUniversityOpportunities } from '../../../lib/opportunities';
import { getRecentAnnouncements, getPopularCommunities } from '../../../lib/dashboard';

const CURRENT_TERM = '2026/1'; // matches seed data; will come from a real term/config table later

export default async function DashboardPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/auth/login');

  const [courses, gpa, globalOpps, uniOpps, announcements, popularCommunities] = await Promise.all([
    getMyCourses(ctx.userId),
    getGpaSummary(ctx.userId, CURRENT_TERM),
    getGlobalOpportunities(),
    getUniversityOpportunities(ctx.universityId),
    getRecentAnnouncements(ctx.userId),
    getPopularCommunities(ctx.universityId),
  ]);

  const opportunities = [...uniOpps, ...globalOpps].slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl text-bone mb-1">{greeting}, {ctx.name.split(' ')[0]} 👋</h1>
      <p className="text-muted mb-8">Stay focused, keep building, and make the most of your campus experience.</p>

      {/* Stat row — only shows GPA/CGPA once there's a graded course to
          compute from, rather than showing a misleading 0.00 */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <StatCard label="Courses" value={String(courses.length)} />
        <StatCard label="Current GPA" value={gpa.gpa !== null ? gpa.gpa.toFixed(2) : '—'} />
        <StatCard label="CGPA" value={gpa.cgpa !== null ? gpa.cgpa.toFixed(2) : '—'} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <QuickAction href="/community" icon={<PeopleIcon />} title="Join a Community" subtitle="Find your people" />
        <QuickAction href="/opportunities" icon={<BriefcaseIcon />} title="Explore Opportunities" subtitle="Jobs, internships, projects" />
        <QuickAction href="/academics" icon={<BookIcon />} title="Check Academic Info" subtitle="Guides, resources, deadlines" />
        <QuickAction href="/campus" icon={<MapIcon />} title="View Campus Map" subtitle="Find your way around" />
      </div>

      {/* Main content + right-side panel, so the page doesn't trail off
          into empty space below two short lists on wide screens. */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-bone text-lg">My Courses</h2>
              <Link href="/academics" className="text-sm text-gold hover:text-gold-bright">View all</Link>
            </div>
            {courses.length === 0 ? (
              <p className="text-muted text-sm border border-dashed border-border rounded-md p-6 text-center">
                No courses yet this term.
              </p>
            ) : (
              <div className="grid gap-3">
                {courses.slice(0, 3).map((c) => (
                  <Link key={c.id} href={`/academics/courses/${c.id}`} className="block bg-surface border border-border rounded-md p-4 hover:border-gold/40 transition-colors">
                    <p className="text-bone text-sm"><span className="text-gold">{c.code}</span> — {c.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-bone text-lg">Opportunities</h2>
              <Link href="/opportunities" className="text-sm text-gold hover:text-gold-bright">View all</Link>
            </div>
            {opportunities.length === 0 ? (
              <p className="text-muted text-sm border border-dashed border-border rounded-md p-6 text-center">
                No opportunities right now.
              </p>
            ) : (
              <div className="grid gap-3">
                {opportunities.map((o) => (
                  <Link key={o.id} href={`/opportunities/${o.id}`} className="block bg-surface border border-border rounded-md p-4 hover:border-gold/40 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-bone text-sm">{o.title}</p>
                        <p className="text-muted text-xs">{o.organization}</p>
                      </div>
                      {o.deadline && (
                        <span className="text-gold text-xs whitespace-nowrap ml-3">
                          {new Date(o.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right-side panel */}
        <div className="grid gap-8">
          <section>
            <h2 className="text-bone text-lg mb-4">Recent Announcements</h2>
            {announcements.length === 0 ? (
              <p className="text-muted text-sm border border-dashed border-border rounded-md p-4 text-center">
                Nothing new right now.
              </p>
            ) : (
              <div className="grid gap-3">
                {announcements.map((a) => (
                  <div key={a.id} className="bg-surface border border-border rounded-md p-4">
                    <p className="text-bone text-sm mb-1">{a.title}</p>
                    {a.body && <p className="text-muted text-xs line-clamp-2">{a.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-bone text-lg mb-4">Popular Communities</h2>
            {popularCommunities.length === 0 ? (
              <p className="text-muted text-sm border border-dashed border-border rounded-md p-4 text-center">
                No communities yet.
              </p>
            ) : (
              <div className="grid gap-3">
                {popularCommunities.map((c) => (
                  <div key={c.orgNodeId} className="bg-surface border border-border rounded-md p-4 flex justify-between items-center">
                    <p className="text-bone text-sm">{c.name}</p>
                    <span className="text-muted text-xs">{c.memberCount} members</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4 text-center">
      <p className="text-2xl text-gold mb-1">{value}</p>
      <p className="text-muted text-xs">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon, title, subtitle }: { href: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Link href={href} className="bg-surface border border-border rounded-md p-4 flex items-center gap-3 hover:border-gold/40 transition-colors">
      <div className="w-9 h-9 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-bone text-sm truncate">{title}</p>
        <p className="text-muted text-xs truncate">{subtitle}</p>
      </div>
    </Link>
  );
}

function PeopleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="17" cy="8" r="2.3" opacity="0.6" /><path d="M16 14.2c2.9.5 5 2.6 5 5.8" opacity="0.6" /></svg>;
}
function BriefcaseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="13" rx="1.5" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" /></svg>;
}
function BookIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5" /></svg>;
}
function MapIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" /></svg>;
}
