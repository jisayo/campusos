import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from './lib/db';
import { redis } from './lib/redis';
import { loadAuthContext } from '@campusos/shared/auth';
import type { RoleType } from '@campusos/shared/types';

// Route classification — mirrors brief §31 exactly.
const PUBLIC_PREFIXES = ['/', '/about', '/features', '/contact', '/auth'];
const ROLE_GATE: Record<string, RoleType> = {
  '/admin': 'admin',
  '/adviser': 'adviser',
  '/lecturer': 'lecturer',
  '/rep': 'rep',
};

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // [0] Public routes skip everything.
  if (matchesPrefix(pathname, PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }

  // [1] Authenticate — JWT carries identity only, never roles/permissions
  // (see docs/ARCHITECTURE.md for why roles are resolved server-side instead).
  const token = req.cookies.get('session')?.value;
  if (!token) {
    return redirectToLogin(req);
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    userId = payload.sub as string;
  } catch {
    return redirectToLogin(req);
  }

  // [2] Load authorization context (Redis-cached, explicitly invalidated on write).
  const ctx = await loadAuthContext(db, redis, userId);
  if (!ctx || ctx.status === 'suspended') {
    return redirectToLogin(req);
  }

  // [3] Route classifier — is this route role-gated?
  const roleGatePrefix = Object.keys(ROLE_GATE).find(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  // [4] Authorize.
  if (roleGatePrefix) {
    const requiredRole = ROLE_GATE[roleGatePrefix];
    const hasRole = ctx.roles.some((r) => r.roleType === requiredRole);
    if (!hasRole) {
      // 403, not a redirect — but also not a 404, since the route's
      // existence isn't sensitive (unlike private resource IDs).
      return NextResponse.rewrite(new URL('/403', req.url));
    }
  }

  // Scoped, resource-level checks (e.g. "is this the lecturer for THIS
  // course") happen inside the specific route/API handler via `can()`,
  // since they need a resourceOrgNodeId the middleware layer doesn't have.

  const res = NextResponse.next();
  res.headers.set('x-user-id', ctx.userId); // handlers read this instead of re-verifying
  return res;
}

function redirectToLogin(req: NextRequest) {
  const url = new URL('/auth/login', req.url);
  url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return new TextEncoder().encode(secret);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
