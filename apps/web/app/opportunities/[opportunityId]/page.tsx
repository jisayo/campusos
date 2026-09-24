import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthContext } from '../../../lib/authz';
import { getOpportunity } from '../../../lib/opportunities';
import { PublicNav } from '../../(public)/components/PublicNav';
import { AppShell } from '../../../components/AppShell';

export default async function OpportunityDetailPage({ params }: { params: { opportunityId: string } }) {
  const ctx = await getAuthContext();
  const opp = await getOpportunity(params.opportunityId);

  if (!opp) notFound();

  // Global opportunities are visible to anyone. A university-specific one
  // is only visible to a logged-in user belonging to that exact
  // university — otherwise 404, not 403, so a visitor browsing without an
  // account can't tell a given ID even exists (see docs/ARCHITECTURE.md).
  if (!opp.isGlobal && (!ctx || ctx.universityId !== opp.universityId)) {
    notFound();
  }

  const content = (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <Link href="/opportunities" className="text-sm text-muted hover:text-bone mb-6 inline-block">
        ← Opportunities
      </Link>

      <span className="inline-block text-xs text-gold border border-gold/30 rounded-full px-2 py-0.5 mb-4 capitalize">
        {opp.category}
      </span>
      <h1 className="text-3xl text-bone mb-1">{opp.title}</h1>
      <p className="text-muted mb-6">{opp.organization}</p>

      {opp.deadline && (
        <div className="bg-surface border border-border rounded-md p-4 mb-6 inline-block">
          <p className="text-xs text-muted mb-1">Deadline</p>
          <p className="text-gold">
            {new Date(opp.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}

      {opp.description && (
        <section className="mb-6">
          <h2 className="text-bone text-sm mb-2">About this opportunity</h2>
          <p className="text-muted text-sm leading-relaxed">{opp.description}</p>
        </section>
      )}

      {opp.eligibility && (
        <section className="mb-8">
          <h2 className="text-bone text-sm mb-2">Eligibility</h2>
          <p className="text-muted text-sm leading-relaxed">{opp.eligibility}</p>
        </section>
      )}

      {opp.applyUrl && (
        <a
          href={opp.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gold text-ink px-6 py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors"
        >
          Apply now
        </a>
      )}
    </div>
  );

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
