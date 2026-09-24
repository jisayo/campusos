// Page/layout-level authorization. Middleware only checks "is there a
// valid session" (Edge-safe). Everything requiring the database — "does
// this user have this role", "can they act on this resource" — happens
// here instead, called from a Server Component layout or page.
//
// Usage in a role-gated layout, e.g. app/admin/layout.tsx:
//
//   import { requireRole } from '../../lib/authz';
//   export default async function AdminLayout({ children }) {
//     await requireRole('admin'); // redirects/404s if not satisfied
//     return <>{children}</>;
//   }

import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { db } from './db';
import { redis } from './redis';
import { loadAuthContext, can, type Action, type RoleType, type AuthContext } from '@campusos/shared';

/** Reads the identity middleware already verified, then loads full context. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const userId = headers().get('x-user-id');
  if (!userId) return null;
  return loadAuthContext(db, redis, userId);
}

/** Call at the top of a role-gated layout/page. Redirects to login if no
 * session; 404s (not 403) if logged in but lacking the role, so a Student
 * poking at /admin doesn't get confirmation the route exists. */
export async function requireRole(role: RoleType): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/auth/login');
  if (ctx.status === 'suspended') redirect('/auth/login');
  if (!ctx.roles.some((r) => r.roleType === role)) notFound();
  return ctx;
}

/** Call inside a scoped page/API route for resource-level checks. */
export async function requireCan(action: Action, targetOrgNodeId: string | null) {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/auth/login');
  const allowed = await can(db, ctx, action, targetOrgNodeId);
  if (!allowed) notFound();
  return ctx;
}
