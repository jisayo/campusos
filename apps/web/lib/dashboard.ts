import { db } from './db';

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
}

/** Real announcement-type notifications for this user — not mocked. */
export async function getRecentAnnouncements(userId: string, limit = 3): Promise<Announcement[]> {
  const res = await db.query(
    `select id, title, body, created_at from notifications
     where user_id = $1 and type = 'announcement'
     order by created_at desc limit $2`,
    [userId, limit]
  );
  return res.rows.map((r) => ({ id: r.id, title: r.title, body: r.body, createdAt: r.created_at }));
}

export interface PopularCommunity {
  orgNodeId: string;
  name: string;
  memberCount: number;
}

/** Org nodes with the most active memberships platform-wide — a real
 * aggregate, not a hardcoded "popular" list. Scoped to the user's own
 * university so a student never sees another school's community sizes. */
export async function getPopularCommunities(universityId: string, limit = 3): Promise<PopularCommunity[]> {
  const res = await db.query(
    `select n.id as org_node_id, n.name, count(*) as member_count
     from user_org_memberships m
     join org_nodes n on n.id = m.org_node_id
     where n.university_id = $1 and m.status = 'active'
     group by n.id, n.name
     order by member_count desc
     limit $2`,
    [universityId, limit]
  );
  return res.rows.map((r) => ({
    orgNodeId: r.org_node_id,
    name: r.name,
    memberCount: parseInt(r.member_count, 10),
  }));
}
