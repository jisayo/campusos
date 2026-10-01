import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/passwords';
import { sendVerificationEmail } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const universityId =
      typeof body.universityId === 'string' ? body.universityId : '';

    if (!name || !email || !password || !universityId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Please enter a valid name' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: 'Password is too long' },
        { status: 400 }
      );
    }

    // Confirm that the university actually exists and is active.
    const university = await db.query(
      `select id
       from universities
       where id = $1
         and status = 'active'
       limit 1`,
      [universityId]
    );

    if (university.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invalid university' },
        { status: 400 }
      );
    }

    // Email is unique within a university.
    const existing = await db.query(
      `select id
       from users
       where university_id = $1
         and lower(email) = lower($2)
       limit 1`,
      [universityId, email]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create the account and its default student role together.
    const client = await db.connect();

    let userId: string;

    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `insert into users
          (university_id, email, password_hash, name, status, email_verified_at)
         values
          ($1, $2, $3, $4, 'active', null)
         returning id`,
        [universityId, email, passwordHash, name]
      );

      userId = userRes.rows[0].id;

      await client.query(
        `insert into roles
          (user_id, scope_org_node_id, role_type)
         values
          ($1, null, 'student')`,
        [userId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // Generate a cryptographically secure email-verification token.
    const token = randomBytes(32).toString('hex');

    await db.query(
      `insert into verification_tokens
        (user_id, token, type, expires_at)
       values
        ($1, $2, 'email_verify', now() + interval '24 hours')`,
      [userId, token]
    );

    // In development this is printed to the terminal by email.ts.
    // In production, RESEND_API_KEY sends the actual email.
    try {
      await sendVerificationEmail(email, name, token);
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
    }

    return NextResponse.json({
      ok: true,
      redirectTo: '/auth/verify-sent',
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    // PostgreSQL unique-constraint race protection.
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to create account. Please try again.' },
      { status: 500 }
    );
  }
}
