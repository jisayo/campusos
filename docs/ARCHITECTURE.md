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

**Revised split (middleware vs. page-level):** originally all of this ran
in `middleware.ts`. In practice, Next.js's Node.js middleware runtime
(needed because `pg`/`ioredis` don't work in the default Edge runtime)
proved unreliable with `ioredis` in this environment even when explicitly
configured. Rather than depend on that framework feature, the check is
now split by what each layer can safely do:

- **`middleware.ts`** — Edge-safe only. Verifies the JWT signature (via
  `jose`, which works in Edge) and confirms a session exists. No database
  access. Sets `x-user-id` for downstream layers.
- **`lib/authz.ts`** (`requireRole`, `requireCan`) — called from a
  layout or page (Server Components, which always run in full Node.js
  regardless of middleware settings). Does the actual database-backed
  role/permission check via `loadAuthContext`/`can()`.

This is arguably a cleaner separation than the original design, not just
a workaround: middleware answers "is this a real session", pages answer
"is this session allowed to see this page". See `app/admin/layout.tsx`
for the worked pattern — every role-gated route (`/adviser`, `/lecturer`,
`/rep`) should follow the same shape.

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

## Opportunities scope: Global vs. University-specific (two-tier, not three)

`opportunities.university_id` is nullable: `null` = Global (visible to every
university on the platform), set = visible only to that university.
Deliberately **no** intermediate "national" tier (e.g. "Nigeria-only") —
a scholarship that isn't tied to one specific university is just Global,
even if in practice it's only relevant to one country. This keeps the
filtering logic to a single boolean check instead of a
university/country/worldwide three-way match, at the acceptable cost of
occasionally showing a country-specific opportunity to students outside
that country. Revisit only if CampusOS actually expands to multiple
countries and this starts causing real confusion — not preemptively.

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

**First vertical slice built** (`/academics`, `/academics/courses/[courseId]`):
data access lives in `lib/academics.ts` and is called **directly from
Server Components** — no API route layer for these reads. This is
deliberate: Next.js Server Components run in Node.js and can query
Postgres directly, so an API route would just be an unnecessary hop for
data that's only ever consumed by this app's own pages. API routes are
still the right tool for anything a client component needs to call after
the initial render (mutations, client-side interactivity), or anything a
future separate client (mobile app) needs — see the community post
DELETE route for that pattern. Course-level access control reuses
`user_org_memberships` (not `enrollments`) as the source of truth for
"can this user see this course," consistent with memberships being the
general community/resource access mechanism.

A `packages/db/seed.sql` script inserts one university, a full org
chain (faculty → department → programme → level → course_group), one
test user, and one course with a resource and an assignment, so this
slice can be verified against real data (`npm run db:seed`).

**Temporary dev-only auth bypass:** `app/api/dev/login-as-seed-user/route.ts`
issues a valid session cookie for the seeded user with no password check,
purely so protected pages can be tested before real login exists. It
self-disables in production (`NODE_ENV === 'production'`) but **must be
deleted once real login/register API routes are built** — it is not a
pattern to extend, just a temporary unblock.

**Second vertical slice built** (`/opportunities`, `/opportunities/[opportunityId]`):
this is the first route that must render differently for logged-out
visitors vs. logged-in users **on the same URL**, per the product
decision that Opportunities should be useful before signing in. This
required extracting the sidebar/topbar shell out of
`app/(app)/layout.tsx` into a plain component (`components/AppShell.tsx`),
since Next.js route-group layouts can't conditionally apply — a page
either sits inside a route group or it doesn't. The page itself calls
`getAuthContext()` (which returns `null` for logged-out visitors, not an
error) and wraps its content in `<AppShell>` or `<PublicNav>` accordingly.

Middleware also gained a third route category beyond
public/protected: **optional-auth** (`/opportunities`). These routes
never redirect to login; if a valid session cookie exists, middleware
attaches `x-user-id` so the page can personalize, but a missing or
invalid token just falls through as a logged-out view rather than
blocking access — the opposite failure mode from protected routes,
where a missing token blocks access.

Visibility rule for a single opportunity: Global (`university_id = null`)
is visible to anyone; university-specific is visible only to a logged-in
user whose `universityId` matches — otherwise `notFound()` (404, not 403),
consistent with the existing rule that a resource's existence itself
shouldn't be confirmable to someone without access to it.

## Design system: light/dark mode

Colors are defined as CSS variables (`--ink`, `--surface`, `--border`,
`--bone`, `--muted`, `--gold`, `--gold-bright`) in `globals.css`, and
`tailwind.config.ts` maps each Tailwind color name to its variable via
`rgb(var(--x) / <alpha-value>)`. This means every page already written —
Dashboard, Academics, Opportunities, the homepage — became theme-aware
with **zero markup changes**, since `bg-ink`/`text-bone`/etc. now resolve
differently depending on which theme is active, without any `dark:`
prefixed classes scattered through the codebase.

Dark is the default (`:root`); `[data-theme="light"]` on `<html>`
overrides every variable for light mode. `components/ThemeToggle.tsx`
flips the attribute and persists the choice to `localStorage`. A small
inline script in the root `<head>` (not a React effect — effects run
after first paint) reads that preference before hydration to avoid a
flash of the wrong theme on load. `<html>` carries `suppressHydrationWarning`
specifically because of this script — it intentionally sets an attribute
before React hydrates, which is a known, harmless mismatch pattern.

**Settled principle: elements sitting on a permanently-dark surface (the
homepage hero photo) must NEVER use the theme-tied tokens (`ink`, `bone`,
`muted`, `gold`) — only fixed colors.** The theme tokens are correct for
the *page background*, which genuinely changes between themes. The hero
photo does not lighten in light mode, so anything overlaid on it —
the nav (`PublicNav`'s `onPhoto` prop), the headline/subtext, the
floating verification card — must stay a fixed light color/dark
translucent surface regardless of which theme is active. Using the
theme tokens here was the actual root cause of two real bugs found in
testing: the nav going illegible-dark-on-dark in light mode, and the
floating card flipping to a stark white box clashing with the photo.
Any new element added to the hero must follow this same fixed-color
pattern, not the theme tokens, or the same bug will recur.

## GPA/CGPA (reinstated)

Originally excluded from scope, then explicitly reinstated. Uses the
Nigerian 5-point grading scale (A=5 … F=0), not the 4.0 scale — this
matters because it changes what a given GPA number means, and OAU is the
reference university. Requires `courses.credit_units` (added to schema)
for weighting. `getGpaSummary()` in `lib/academics.ts` computes current-
term GPA and cumulative CGPA from `enrollments.grade`, excluding any
enrollment without a recorded grade (i.e., in-progress courses don't
affect either number, matching how GPA actually works academically).

## Homepage hero image

**Resolved** — user supplied `apps/web/public/hero.jpg` directly (a real
photograph). Rendered via Next.js's `<Image fill>` with a dark gradient
overlay (`from-ink/80 via-ink/55 to-ink/70`) for text legibility, since
the hero text sits directly on top of the photo. Whoever maintains this
project is responsible for confirming rights to use this specific image
commercially — that was not verified by Claude, only the earlier general
constraint (no random web photo without a license) was enforced.

## Fixed light "How it works" band

The homepage's "How CampusOS Works" section uses hardcoded light colors
(`#F2EFE9` background, `#141210` text) rather than the `ink`/`bone`
theme tokens. This is deliberate: it's a permanent visual-rhythm accent
present in both dark and light mode, not something that should invert
with the user's theme choice — matching the reference design, which
alternates dark/light bands regardless of a mode toggle.

## Visual redesign: navy palette + real data wiring

Dark theme's `--ink`/`--surface`/`--border` shifted from warm black to a
cooler navy-black to match the confirmed design reference. `AuthContext`
gained a `name` field (queried in `loadAuthContext`) since personalized
greetings ("Good morning, Jisayo") need it and it wasn't there before.
Dashboard, Academics, and Opportunities were rebuilt to remove the last
hardcoded placeholder cards from early scaffolding — everything on these
three pages now comes from real queries (`getMyCourses`, `getGpaSummary`,
`getGlobalOpportunities`/`getUniversityOpportunities`). Opportunities
gained category filter tabs via a `?category=` URL search param, kept
server-rendered rather than adding client-side state for it.

## Community (third vertical slice)

Feed visibility reuses `user_org_memberships` exactly like Academics'
course access — a post is visible if the viewer belongs to the org node
it was posted in, no separate community-membership concept. Posting uses
a **Server Action** (`submitPost`, defined inline in the page) rather
than a separate API route, since it's only ever invoked from this page's
own form — this is the idiomatic Next.js choice for a mutation with
exactly one caller; a route handler is still the right choice when
multiple callers need it (see the community post DELETE route, kept as a
route handler since a future mobile client would need it too).
`createPost()` re-checks membership itself rather than trusting the
Server Action already did — defense in depth, not redundancy.

## Admin Dashboard — pending

Confirmed as V1 scope, but no visual reference exists for it in any
design sheet provided (only listed as a feature, not mockup up). Will be
built using the same established sidebar/topbar pattern, with sections
per the original brief §27: Users, Universities, Academic Structure,
Reports, Moderation, Audit Logs — not modeled on any specific screenshot.

## Homepage: long-form version

Expanded from a short landing page into the full section set: Hero,
The Problem, Four Pillars, feature grid, Product Showcase, Personalization
flow, CGPA, Opportunities (**real data** — `getGlobalOpportunities()`,
not mocked examples, consistent with the rest of the app's "no fabricated
data" practice), Community structure, Coming Soon, Trust & Security,
How It Works, Latest Updates, Final CTA, Footer. All hero-area fixed-color
rules (see "Design system: light/dark mode" above) still apply — only the
hero section itself needs them, since every section below it sits on the
normal theme-tokened page background, not a permanent photo.

## Real authentication (register/login/logout)

Password hashing via `bcryptjs` (`lib/passwords.ts`). Session creation
consolidated into `lib/session.ts::createSessionResponse()` — used
identically by `/api/auth/register`, `/api/auth/login`, and now the
dev-only bypass route too, so there's exactly one place that creates a
valid session cookie.

**Deliberate scope cut:** registration only collects University, not the
full Faculty/Department/Programme/Level chain — that would need
cascading dropdown APIs (each level's options depend on the previous
selection) that don't exist yet. New users get a tenant-wide `student`
role on sign-up; scoped org memberships (which course groups they can
see) get attached later, either through a future profile/onboarding flow
or by an admin. This means a newly registered user will see an empty
Academics/Community until that's built — a real, known gap, not a bug.

**Login simplification:** looks up by email alone, not the
`(university_id, email)` pair the schema's unique constraint actually
models. Correct as long as emails are unique in practice across the
whole platform at this stage; would need a university selector on the
login form if that assumption ever breaks.

Middleware's public-route list grew to include `/api/auth` and
`/api/universities` — these must be reachable without a session, since
they're what makes logging in and registering possible in the first
place. Missing this was a real bug caught during implementation, not a
hypothetical: without it, the login/register API calls would themselves
get redirected to the login page.

## Bug caught: relative import path miscounting `(app)` route group

`middleware.ts` aside, four pages (`dashboard`, `academics`,
`academics/courses/[courseId]`, `community`) had relative imports one
level too shallow (`../../lib/authz` instead of `../../../lib/authz`) —
the `(app)` route-group folder is a real directory on disk for import
resolution purposes even though Next.js excludes it from the URL. This
had apparently been latent since each file was first written; it only
surfaced as a visible build error once Dashboard was freshly compiled
after other changes. Fixed by programmatically re-deriving every
relative import against the actual filesystem and confirming each one
resolves — worth re-running that kind of check after any large
restructuring, rather than trusting hand-counted `../` segments.

## Dashboard: real right-side panel, not filler

Added a stat-card row (Courses/GPA/CGPA) and a right-side panel
(Announcements, Popular Communities) to close the gap between this app
and the reference design's density — the previous version trailed off
into empty space on wide screens because it only had two short lists.
Both new panel sections use **real queries**, not mocked data:
`getRecentAnnouncements()` reads actual `type = 'announcement'` rows from
the existing `notifications` table (no new table needed — announcements
were already modeled as a notification type); `getPopularCommunities()`
is a real `count(*)` aggregate over `user_org_memberships`, scoped to the
viewer's own university so no one sees another school's community sizes.
With only one seeded user, member counts will legitimately show `1`
everywhere — that's correct behavior for real data with a small sample,
not a bug to paper over with fake numbers.

## Homepage hero: reverted to dashboard-preview style (not photo)

After going back and forth, the final decision was to drop the real
photo hero entirely in favor of a small, static illustrative
dashboard-preview card next to the headline — matching the reference
design exactly, and simpler to maintain than the photo-plus-fixed-color
system this replaced. That whole fixed-color-on-photo apparatus
(`onPhoto` props, hardcoded hex overlays) is now dead weight for the
homepage specifically — `PublicNav`'s `onPhoto` prop is unused there now
but left in the component since nothing else currently needs it removed.
The preview card is explicitly illustrative (static JSX, not a real
query) — same category as a phone-store screenshot, not a functional
dashboard.

## Universities directory (new)

`/universities` — real search (`ilike` on name) and country-grouped
listing, both backed by actual `universities` table queries, no mocked
list. Added to middleware's public-route list since it must work for
logged-out visitors. University detail pages (clicking through to a
specific university's page) are not built — out of scope for this pass.

## Login page: inert "Continue with Google" button

Added to visually match the reference, but it is **not wired to real
OAuth** — clicking it does nothing (disabled, with a title tooltip
saying so). This directly revisits an earlier standing rule ("don't add
unnecessary social login unless explicitly requested") — the visual
element is now present by explicit request, but the underlying
functionality was never asked for and isn't built. Treat this as a
placeholder to either wire up or remove, not a real feature.

## Sign-up: kept functionally simple, styled closer to reference

The reference shows a longer multi-step flow (University → Academic
Details → Interests → Complete). Registration stayed at its existing
2-step (Account, University) — the additional steps would need
cascading dropdown data (faculty depends on university, etc.) that
isn't built. Copy/framing updated to match tone; step count did not.

## Light/dark mode: paused, reverted to single fixed palette

After several rounds of real bugs (nav illegible in light mode, white
card clashing with a photo, hydration warnings), and once the hero photo
itself was dropped in favor of a static dashboard-preview card, the
decision was made to pause the whole light/dark system rather than keep
patching it. Reverted to the single original warm-black/gold palette
(`--ink: 14 13 11`, etc.) as the only theme; removed the
`[data-theme="light"]` CSS block, the system-preference-detection script
in the root layout, and the `<ThemeToggle>` button from both `PublicNav`
and `AppShell`. `components/ThemeToggle.tsx` itself is left in place,
unused, rather than deleted — the CSS-variable token structure
(`ink`/`bone`/`gold`/etc.) is exactly what a toggle would need if
revisited later, so nothing about this reversal makes that harder to
re-enable, it just isn't active right now. `PublicNav` also lost its
`onPhoto` prop/branching entirely, since it existed only to keep nav
text legible on the (now removed) photo hero.

## Consistent hero-band pattern for secondary public pages

About and Features now use the same full-bleed-photo-with-dark-overlay
pattern as the homepage hero, but scoped to just the top section (page
heading + intro), not the whole page — a full-page photo behind long
running text (About's Problem/Philosophy sections) would hurt
readability. They share the **original** `hero.jpg` photo; the homepage
alone uses the newer `hero-home.jpg`, keeping it visually distinct as
the entry point. Contact and Universities don't have this yet — same
treatment, straightforward to add if wanted.

## Homepage: matched to latest reference exactly

Reverted to 6 feature items on the homepage (Academics/Opportunities/
Community/Campus/Messaging/Projects) plus photo card — some duplication
with the Features page is now accepted as fine, per explicit direction.
Added the richer illustrative dashboard-preview card (search bar,
avatar, per-section "View all" links, status dots) and a new "One
platform. Every university." section with a stylized dot-grid world map
(`WorldMap()` — an abstract SVG of dots and connected pins, deliberately
not real cartography, same illustrative category as the dashboard
preview) plus three architecture callout points. All fully static/
decorative, no real data or new images required. "What's happening"
cards still use colored category tags rather than real photo
thumbnails — real photos for those are still pending from the user.

## "What's happening" — real photos, one real card, three illustrative

Rebuilt with actual photo thumbnails (`public/updates/*.jpg`, all
user-provided and licensed) instead of colored category blocks. Only
the **Opportunity** card is backed by a real query
(`getGlobalOpportunities()`, first result) — there's no real data model
yet for generic "events" or "community spotlight" content, so those
three cards are static examples, same illustrative category as the
hero's dashboard-preview card. This is a deliberate, documented choice,
not an accidental regression from the earlier all-real-data version —
matching the reference's 4-category layout required content types this
app doesn't have real tables for yet.

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
