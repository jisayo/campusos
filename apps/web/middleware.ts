import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This file is intentionally Edge-safe: it does ONLY identity verification
// (is this JWT valid?), never database/Redis lookups. Role- and
// resource-level authorization now happens in each protected route's
// layout/page (Server Components, which always run in full Node.js) via
// `requireAuthContext()` / `requireRole()` in lib/authz.ts. See
// docs/ARCHITECTURE.md "Authentication vs. authorization" for why this
// split exists — it avoids depending on Next.js's Node.js middleware
// runtime feature, which proved unreliable with `ioredis` in this
// environment, and is arguably better separation anyway: middleware
// answers "is this a real session", pages answer "is this session
// allowed to see this page".

const PUBLIC_PREFIXES = ['/', '/about', '/features', '/contact', '/auth', '/api/auth', '/api/universities', '/universities'];

// Routes that must work for BOTH logged-out visitors and logged-in users
// on the same URL (e.g. /opportunities shows Global content to everyone,
// plus university-specific content if logged in). These never redirect to
// login — they just attempt to identify the user if a valid session
// exists, and proceed either way.
const OPTIONAL_AUTH_PREFIXES = ['/opportunities'];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (matchesPrefix(pathname, PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('session')?.value;

  if (matchesPrefix(pathname, OPTIONAL_AUTH_PREFIXES)) {
    const res = NextResponse.next();
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        res.headers.set('x-user-id', payload.sub as string);
      } catch {
        // Invalid/expired token on an optional-auth route: just proceed
        // as a logged-out visitor rather than redirecting.
      }
    }
    return res;
  }

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

  // Role-gating and resource-scoped checks (admin/adviser/lecturer/rep,
  // and any `can()` call) now happen in the page/layout itself, not here —
  // this file no longer touches the database.
  const res = NextResponse.next();
  res.headers.set('x-user-id', userId);
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
  // Excludes _next internals AND any file with a common static-asset
  // extension (images, fonts, etc.) — not just favicon.ico specifically.
  // Without this broader exclusion, a request for e.g. /hero.jpg gets
  // treated as a protected route and redirected to login when the
  // visitor isn't authenticated, which is exactly what was silently
  // breaking the homepage hero image.
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|avif)$).*)'],
};
