// Core authorization logic — the ONE place permission decisions are made.
// Both middleware (route gating) and API handlers (resource-level checks)
// must call `can()` rather than re-deriving permission logic locally.
// This is what prevents drift between "what the UI shows" and "what the
// server actually allows" (brief §36 rule 5).

import type { Pool } from 'pg';
import type { Redis } from 'ioredis';
import type { Action, AuthContext, RoleType } from './types';
import { ROLES_GRANTING } from './types';

const AUTH_CTX_TTL_SECONDS = 300; // safety-net TTL; real invalidation is explicit (see below)

export function authContextKey(userId: string) {
  return `authctx:${userId}`;
}

/**
 * Loads a user's roles + org memberships, cached in Redis.
 * Cache is invalidated explicitly whenever roles/status change (see
 * invalidateAuthContext), so the TTL below is a safety net, not the
 * primary correctness mechanism. Approach chosen over embedding roles
 * in the JWT precisely so suspensions/role changes take effect
 * immediately instead of waiting for token expiry — see docs/ARCHITECTURE.md.
 */
export async function loadAuthContext(
  db: Pool,
  redis: Redis,
  userId: string
): Promise<AuthContext | null> {
  const cached = await redis.get(authContextKey(userId));
  if (cached) return JSON.parse(cached);

  const userRes = await db.query(
    `select id, university_id, status from users where id = $1`,
    [userId]
  );
  if (userRes.rowCount === 0) return null;
  const user = userRes.rows[0];

  const rolesRes = await db.query(
    `select id, user_id, scope_org_node_id, role_type from roles where user_id = $1`,
    [userId]
  );
  const membershipsRes = await db.query(
    `select id, user_id, org_node_id, relationship, term, status
     from user_org_memberships where user_id = $1 and status = 'active'`,
    [userId]
  );

  const ctx: AuthContext = {
    userId: user.id,
    universityId: user.university_id,
    status: user.status,
    roles: rolesRes.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      scopeOrgNodeId: r.scope_org_node_id,
      roleType: r.role_type,
    })),
    memberships: membershipsRes.rows.map((m) => ({
      id: m.id,
      userId: m.user_id,
      orgNodeId: m.org_node_id,
      relationship: m.relationship,
      term: m.term,
      status: m.status,
    })),
  };

  await redis.set(authContextKey(userId), JSON.stringify(ctx), 'EX', AUTH_CTX_TTL_SECONDS);
  return ctx;
}

/** Call this from every write path that changes a user's roles or status. */
export async function invalidateAuthContext(redis: Redis, userId: string) {
  await redis.del(authContextKey(userId));
}

/**
 * The single authorization check used everywhere: does this user have a
 * role — at the target org node OR any ancestor of it — that grants `action`?
 * Ancestor check is a single indexed lookup against org_closure, not a
 * runtime recursive traversal (see docs/ARCHITECTURE.md).
 *
 * Pass `targetOrgNodeId = null` for tenant-wide actions (e.g. admin actions
 * not scoped to a specific node).
 */
export async function can(
  db: Pool,
  ctx: AuthContext,
  action: Action,
  targetOrgNodeId: string | null
): Promise<boolean> {
  if (ctx.status !== 'active') return false;

  const grantingRoles: RoleType[] = ROLES_GRANTING[action];
  const tenantWideMatch = ctx.roles.some(
    (r) => r.scopeOrgNodeId === null && grantingRoles.includes(r.roleType)
  );
  if (tenantWideMatch) return true;
  if (targetOrgNodeId === null) return false; // only tenant-wide roles can grant tenant-wide actions

  const scopedRoleIds = ctx.roles
    .filter((r) => r.scopeOrgNodeId !== null && grantingRoles.includes(r.roleType))
    .map((r) => r.scopeOrgNodeId as string);
  if (scopedRoleIds.length === 0) return false;

  const res = await db.query(
    `select 1 from org_closure
     where ancestor_id = any($1::uuid[]) and descendant_id = $2
     limit 1`,
    [scopedRoleIds, targetOrgNodeId]
  );
  return (res.rowCount ?? 0) > 0;
}
