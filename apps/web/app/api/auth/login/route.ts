import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { verifyPassword } from '../../../../lib/passwords';
import { createSessionResponse } from '../../../../lib/session';

// Simplification: looks up by email alone, not (university, email) as the
// schema's unique constraint models it. Fine while each email is
// practically unique across the whole platform; revisit if that stops
// being true (e.g. add a university selector to the login form too).
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const res = await db.query(
    `select id, password_hash, status from users where email = $1 limit 1`,
    [email]
  );
  if (res.rowCount === 0) {
    // Same error for "no such user" and "wrong password" — don't reveal
    // which one it was, that's a basic account-enumeration protection.
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const user = res.rows[0];
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  if (user.status === 'suspended') {
    return NextResponse.json({ error: 'This account has been suspended' }, { status: 403 });
  }

  return createSessionResponse(user.id, '/dashboard');
}
