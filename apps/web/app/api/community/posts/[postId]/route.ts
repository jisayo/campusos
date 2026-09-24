// Example of a SCOPED route: authenticated isn't enough — the user must
// have access to the specific org node this post belongs to.
//
// Demonstrates the 403-vs-404 rule from docs/ARCHITECTURE.md: a post in a
// community the user isn't a member of returns 404 (don't reveal it
// exists), while a post they CAN see but lack permission to moderate
// returns 403.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { redis } from '../../../../../lib/redis';
import { loadAuthContext, can } from '@campusos/shared';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const userId = req.headers.get('x-user-id'); // set by middleware after JWT verify
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const ctx = await loadAuthContext(db, redis, userId);
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const postRes = await db.query(
    `select id, org_node_id, author_id from community_posts where id = $1 and deleted_at is null`,
    [params.postId]
  );
  if (postRes.rowCount === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const post = postRes.rows[0];

  // Is the post even visible to this user? (membership at the node or an
  // ancestor — reusing the same closure-table shape as `can()`.)
  const visible = ctx.memberships.some((m) => m.orgNodeId === post.org_node_id);
  if (!visible) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 }); // hide existence
  }

  const isAuthor = post.author_id === userId;
  const canModerate = await can(db, ctx, 'community.post.moderate', post.org_node_id);
  if (!isAuthor && !canModerate) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 }); // visible, just not allowed
  }

  await db.query(`update community_posts set deleted_at = now() where id = $1`, [params.postId]);
  return NextResponse.json({ ok: true });
}
