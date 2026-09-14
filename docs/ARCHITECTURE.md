# CampusOS — Architecture Decisions

This is the source of truth for architectural decisions. If a future change
contradicts something here, update this doc and explain why (per the brief's
final rule: "before making major architectural changes, explain the change
and why it is necessary").

## Stack

- **Language:** TypeScript everywhere (web, mobile, backend) — one shared
  types/logic package (`@campusos/shared`) prevents drift between layers,
  which matters most for the RBAC model below.
- **Web:** Next.js (App Router) — serves both the public marketing site and
  the authenticated app from one deployable.
- **Mobile:** React Native (Expo), sharing `@campusos/shared` with web.
- **Database:** PostgreSQL, single instance, `tenant_id`/`university_id` on
  every tenant-scoped row.
- **Cache/queue:** Redis — auth-context caching now; notification fan-out
  and search-index sync queues later.

## Deployment shape

Modular monolith, not microservices. One deployable, logically separated
modules (academics, opportunities, community, campus, messaging,
notifications). Given a small team, this gets separation of concerns
without the operational cost of running several services. Split out a
module (most likely search or notifications) only when load actually
demands it.

## Multi-tenancy

Every row that isn't global reference data carries `university_id`.
Enforce isolation at the data layer (Postgres RLS), not just in
application code — a bug in one module must not be able to leak another
university's data.

## Org graph (University → Faculty → Department → Programme → Level → Course)

Modeled as a **DAG**, not a strict tree: a user belongs to multiple nodes
simultaneously (faculty + department + level + several course groups), and
memberships change per term.

- `org_nodes`: the graph itself (id, parent_id, type, university_id).
- `user_org_memberships`: which nodes a user belongs to, with a
  `relationship` (enrolled/staff/advisee/rep) and optional `term`.
- `org_closure`: a **precomputed closure table** (ancestor_id,
  descendant_id, depth) for O(1) "is X under Y" queries.

**Decision: closure table over recursive CTE.** Org structure changes
rarely (a few times per semester); permission checks happen on nearly
every request. Pay the traversal cost once at write time (updating the
closure table when a node moves) rather than on every read.

## RBAC

Five roles: `student`, `rep`, `lecturer`, `adviser`, `admin`. Roles attach
to a **scope org_node** (nullable = tenant-wide), not globally — this
avoids a role-type explosion (no "CS Lecturer" vs "Physics Lecturer" as
distinct types).

**Permission resolution** (`can(userId, action, resourceOrgNodeId)`):
does the user have a role, at the target node or an ancestor of it, whose
role_type grants that action? Implemented as a single indexed join against
`org_closure` — see `packages/shared/src/auth.ts`. This is the one
function every middleware layer and API handler calls; never re-derive
permission logic ad hoc in a route handler.

Role-specific dashboards (Admin/Adviser/Lecturer/Rep) are **composed
views** over the same modules and the same `can()` checks — not separate
backend services or duplicated business logic.

Adviser is deliberately **observe-and-report only**: no role_type grants
it any write-permitting action in `ROLES_GRANTING`. It can read, and it
can write reports, but nothing else.

## Authentication vs. authorization

**Decision: JWT carries identity only. Roles/permissions are resolved
server-side per request, via a Redis-cached auth context, with explicit
invalidation on write.**

Rejected alternative: embedding roles as JWT claims. That's faster (no
per-request lookup) but incorrect by construction — a suspended user or a
revoked role stays valid until the token expires. Since suspension and
role changes are real Admin actions in this product, correctness wins.
The cost of the chosen approach is one Redis lookup per request plus an
explicit cache-invalidation call wherever roles/status are written
(`invalidateAuthContext`) — cheap relative to the guarantee it buys.

## Route classification & middleware chain

Four route kinds (see brief §31):
- **Public** — no auth check.
- **Authenticated** — valid session required.
- **Scoped** — session + resource-level `can()` check (e.g. is this user
  enrolled in *this* course).
- **Role-gated** — session + a specific role_type required (`/admin/*`,
  `/adviser/*`, `/lecturer/*`, `/rep/*`).

Chain: authenticate (verify JWT) → load auth context (cached) → classify
route → authorize. Role-gating happens in `middleware.ts`; resource-level
scoped checks happen inside the specific route/API handler, since only the
handler knows the resource's org_node_id.

**403 vs 404:** a resource the user is authorized to know exists but can't
act on returns 403. A resource whose *existence* itself is sensitive
(e.g. a private course group's posts) returns 404 instead — 403 would
confirm it exists.

## Search (deferred build, decided direction)

Start with **Postgres full-text search** (`pg_trgm` + `to_tsvector`), not a
dedicated search service. At tens-of-thousands-of-users scale across many
tenants, per-tenant corpus size is well within what Postgres handles, and
it reuses existing RLS-based tenant/permission filtering instead of
building a second permission model. Isolate all search queries behind a
single `SearchService` interface so the implementation can be swapped for
a dedicated index (e.g. Typesense) later without touching call sites.

## Messaging

Schema supports group conversations from day one (`conversations` /
`conversation_participants` / `messages`, with `is_group`), but the MVP
**UI only exposes 1:1** — per the brief's "do not overbuild messaging in
the first version." This satisfies both "support future group chat" and
"don't overbuild now" without contradiction: the N=2 case of a group
schema is 1:1.

## Notifications fan-out

A triggering action (e.g. a Lecturer publishing a course announcement)
inserts one row into `notification_fanout_jobs` — fast, always succeeds.
A background worker (`processNextFanoutJob`) claims pending jobs with
`FOR UPDATE SKIP LOCKED` (safe for multiple worker instances), expands the
target audience via `org_closure` (so a Faculty-level notice reaches every
Department/Level/Course beneath it), and inserts `notifications` rows in
batches of 500. `cursor_user_id` on the job lets a crashed/restarted
worker resume from the last completed batch instead of re-notifying
everyone or silently dropping the rest. See `packages/shared/src/notifications.ts`.

## Academics workflow

`enrollments` tracks the academic-record lifecycle (registered → active →
completed/withdrawn) per term, distinct from `user_org_memberships` (which
just tracks community/permission membership in a course_group). A student
enrolling in a course creates both: an `enrollments` row (grade/status
tracking) and a `user_org_memberships` row (so they see the course's
community, resources, and get its notifications). `assignment_submissions`
tracks per-user submission state and grading, one row per (assignment, user).

## Not yet designed / open

- **Search ACL enforcement detail** — once search moves beyond a single
  university's Postgres FTS, cross-tenant query isolation needs explicit
  test coverage.
- **Real-time delivery for Messages** — schema supports conversations now;
  whether unread counts/typing indicators are polled or pushed (e.g. via
  WebSocket/SSE) isn't decided. Deferred since MVP messaging is 1:1 only.

## Explicitly out of scope for MVP (per brief §38)

Payments, marketplace (accommodation/transport), advanced AI features,
group messaging *UI* (schema only), cryptocurrency, CGPA calculator.
