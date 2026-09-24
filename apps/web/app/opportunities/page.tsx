import Link from 'next/link';
import { getAuthContext } from '../../lib/authz';
import { getGlobalOpportunities, getUniversityOpportunities, type Opportunity } from '../../lib/opportunities';
import { PublicNav } from '../(public)/components/PublicNav';
import { AppShell } from '../../components/AppShell';

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const ctx = await getAuthContext(); // null if logged out — that's expected here, not an error
  const activeCategory = searchParams.category || 'all';

  const global = await getGlobalOpportunities();
  const university = ctx ? await getUniversityOpportunities(ctx.universityId) : [];

  const allOpportunities = [...university, ...global].filter(
    (o) => activeCategory === 'all' || o.category === activeCategory
  );

  const content = (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl text-bone mb-1">Opportunities</h1>
      <p className="text-muted mb-6">
        {ctx
          ? 'Scholarships, internships, and jobs — open to everyone, plus ones specific to your university.'
          : 'Scholarships, internships, and jobs open to students everywhere. Sign in to also see opportunities specific to your university.'}
      </p>

      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((cat) => (
          <CategoryTab key={cat.value} value={cat.value} label={cat.label} active={activeCategory === cat.value} />
        ))}
      </div>

      {allOpportunities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {allOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}

      {!ctx && (
        <div className="mt-10 border border-gold/20 bg-gold/5 rounded-md p-6 text-center">
          <p className="text-bone mb-1">See opportunities from your university too</p>
          <p className="text-muted text-sm mb-4">Sign in to unlock opportunities specific to your school.</p>
          <Link href="/auth/register" className="inline-block bg-gold text-ink px-5 py-2.5 rounded-sm font-medium hover:bg-gold-bright transition-colors">
            Create your account
          </Link>
        </div>
      )}
    </div>
  );

  // Same URL, two shells: logged-in users get the full app sidebar,
  // logged-out visitors get the public marketing nav. See docs/ARCHITECTURE.md.
  if (ctx) {
    return <AppShell>{content}</AppShell>;
  }
  return (
    <div>
      <PublicNav />
      {content}
    </div>
  );
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'scholarship', label: 'Scholarships' },
  { value: 'internship', label: 'Internships' },
  { value: 'job', label: 'Jobs' },
  { value: 'competition', label: 'Competitions' },
  { value: 'project', label: 'Projects' },
];

function CategoryTab({ value, label, active }: { value: string; label: string; active: boolean }) {
  const href = value === 'all' ? '/opportunities' : `/opportunities?category=${value}`;
  return (
    <Link
      href={href}
      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-gold text-ink border-gold font-medium'
          : 'border-border text-muted hover:border-gold/40 hover:text-bone'
      }`}
    >
      {label}
    </Link>
  );
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  return (
    <Link
      href={`/opportunities/${opp.id}`}
      className="block bg-surface border border-border rounded-md p-4 hover:border-gold/40 transition-colors"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="inline-block text-xs text-gold border border-gold/30 rounded-full px-2 py-0.5 mb-2 capitalize">
            {opp.category}
          </span>
          <p className="text-bone">{opp.title}</p>
          <p className="text-muted text-sm">{opp.organization}</p>
        </div>
        <div className="text-right whitespace-nowrap">
          {!opp.isGlobal && <span className="text-xs text-muted block mb-1">Your university</span>}
          {opp.deadline && (
            <span className="text-gold text-xs">
              Apply by {new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-md p-8 text-center">
      <p className="text-bone mb-1">No opportunities right now</p>
      <p className="text-muted text-sm">Check back soon — new opportunities are added regularly.</p>
    </div>
  );
}
