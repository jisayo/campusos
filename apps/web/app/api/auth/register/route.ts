import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/passwords';
import { createSessionResponse } from '../../../../lib/session';

// Simplified for now: registration only asks for University, not the full
// Faculty/Department/Programme/Level chain. Those get attached later
// (via profile/settings, not yet built, or an admin) rather than blocking
// sign-up on a multi-step cascading form. This is a deliberate scope cut,
// not an oversight — see docs/ARCHITECTURE.md.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, universityId } = body;

  if (!name || !email || !password || !universityId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const existing = await db.query(
    `select id from users where university_id = $1 and email = $2`,
    [universityId, email]
  );
  if ((existing.rowCount ?? 0) > 0) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const userRes = await db.query(
    `insert into users (university_id, email, password_hash, name, status, email_verified_at)
     values ($1, $2, $3, $4, 'active', null)
     returning id`,
    [universityId, email, passwordHash, name]
  );
  const userId = userRes.rows[0].id;

  // Every new user gets a tenant-wide 'student' role by default. Scoped
  // memberships (faculty/department/course groups) come later once
  // they're actually enrolled somewhere — see docs/ARCHITECTURE.md RBAC.
  await db.query(
    `insert into roles (user_id, scope_org_node_id, role_type) values ($1, null, 'student')`,
    [userId]
  );

  return createSessionResponse(userId, '/dashboard');
}
