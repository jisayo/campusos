// Data access for Opportunities. Two-tier model per docs/ARCHITECTURE.md:
// university_id = null means Global (visible to everyone, logged in or
// not); a set university_id restricts it to that university only.

import { db } from './db';

export interface Opportunity {
  id: string;
  category: string;
  title: string;
  organization: string;
  description: string | null;
  deadline: string | null;
  isGlobal: boolean;
}

/** Global opportunities — safe to show to anyone, logged in or not. */
export async function getGlobalOpportunities(): Promise<Opportunity[]> {
  const res = await db.query(
    `select id, category, title, organization, description, deadline
     from opportunities
     where university_id is null
     order by deadline asc nulls last`
  );
  return res.rows.map(toOpportunity(true));
}

/** University-specific opportunities — only shown to logged-in users
 * belonging to that university. */
export async function getUniversityOpportunities(universityId: string): Promise<Opportunity[]> {
  const res = await db.query(
    `select id, category, title, organization, description, deadline
     from opportunities
     where university_id = $1
     order by deadline asc nulls last`,
    [universityId]
  );
  return res.rows.map(toOpportunity(false));
}

export interface OpportunityDetail extends Opportunity {
  eligibility: string | null;
  applyUrl: string | null;
  universityId: string | null;
}

export async function getOpportunity(id: string): Promise<OpportunityDetail | null> {
  const res = await db.query(
    `select id, category, title, organization, description, eligibility,
            apply_url, deadline, university_id
     from opportunities where id = $1`,
    [id]
  );
  if (res.rowCount === 0) return null;
  const r = res.rows[0];
  return {
    id: r.id,
    category: r.category,
    title: r.title,
    organization: r.organization,
    description: r.description,
    eligibility: r.eligibility,
    applyUrl: r.apply_url,
    deadline: r.deadline,
    universityId: r.university_id,
    isGlobal: r.university_id === null,
  };
}

function toOpportunity(isGlobal: boolean) {
  return (r: any): Opportunity => ({
    id: r.id,
    category: r.category,
    title: r.title,
    organization: r.organization,
    description: r.description,
    deadline: r.deadline,
    isGlobal,
  });
}
