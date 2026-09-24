import { db } from './db';

export interface CommunityPost {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  orgNodeName: string;
  orgNodeType: string;
}

/** Feed scoped to org nodes the user actually belongs to — reusing
 * user_org_memberships as the visibility source of truth, same as
 * Academics course access. Optionally filtered to one node type
 * (university/faculty/department/course_group) matching the tabbed
 * filter in the reference design. */
export async function getCommunityFeed(userId: string, typeFilter?: string): Promise<CommunityPost[]> {
  const res = await db.query(
    `select p.id, p.body, p.created_at, u.name as author_name,
            n.name as org_node_name, n.type as org_node_type
     from community_posts p
     join org_nodes n on n.id = p.org_node_id
     join users u on u.id = p.author_id
     where p.deleted_at is null
       and p.org_node_id in (
         select org_node_id from user_org_memberships
         where user_id = $1 and status = 'active'
       )
       and ($2::text is null or n.type = $2)
     order by p.created_at desc
     limit 50`,
    [userId, typeFilter ?? null]
  );
  return res.rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    authorName: r.author_name,
    orgNodeName: r.org_node_name,
    orgNodeType: r.org_node_type,
  }));
}

/** The org nodes a user can post into — same membership check, used to
 * populate the "post to..." selector. */
export async function getPostableNodes(userId: string) {
  const res = await db.query(
    `select n.id, n.name, n.type
     from user_org_memberships m
     join org_nodes n on n.id = m.org_node_id
     where m.user_id = $1 and m.status = 'active'
     order by n.type`,
    [userId]
  );
  return res.rows as { id: string; name: string; type: string }[];
}

export async function createPost(authorId: string, orgNodeId: string, body: string) {
  if (!body.trim()) throw new Error('Post body cannot be empty');

  // Defense in depth: verify membership here too, not just in the calling
  // Server Action — this function should never trust an unchecked caller.
  const membership = await db.query(
    `select 1 from user_org_memberships where user_id = $1 and org_node_id = $2 and status = 'active'`,
    [authorId, orgNodeId]
  );
  if (membership.rowCount === 0) {
    throw new Error('Not a member of this community');
  }

  await db.query(
    `insert into community_posts (org_node_id, author_id, body) values ($1, $2, $3)`,
    [orgNodeId, authorId, body.trim()]
  );
}
