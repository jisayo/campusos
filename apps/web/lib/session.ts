import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export async function createSessionResponse(userId: string, redirectTo: string): Promise<NextResponse> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret));

  const res = NextResponse.json({ ok: true, redirectTo });
  res.cookies.set('session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
