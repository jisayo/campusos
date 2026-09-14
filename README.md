# CampusOS

## Structure

```
campusos/
├── apps/
│   └── web/              Next.js app (public site + authenticated app)
│       ├── middleware.ts       Auth chain: authenticate → load context → classify → authorize
│       ├── app/api/community/posts/[postId]/route.ts
│                                Example SCOPED route (can() + 404-vs-403 pattern)
│       ├── lib/db.ts, lib/redis.ts
│       └── tailwind.config.ts  Black/gold design tokens (brief §33)
├── packages/
│   ├── shared/            @campusos/shared — types + can() authorization core.
│   │                      Import this from apps/web AND (future) apps/mobile.
│   └── db/schema.sql      Full Postgres schema
└── docs/
    └── ARCHITECTURE.md    Source of truth for every architectural decision made so far
```

## What's built

- Full DB schema: multi-tenancy, org graph + closure table, RBAC, academics
  (courses, enrollments, assignments, submissions), opportunities, community,
  messaging (group-capable schema), notifications + fan-out jobs, audit log.
- Shared authorization core (`can()`), used identically by middleware and API handlers.
- Working middleware implementing the full auth chain and route classification.
- One fully worked example of a scoped, permission-checked API route.
- Notifications fan-out worker: batched, resumable, closure-table-driven audience expansion.
- Public site: home, about, features, contact.
- Auth flow: login page, multi-step registration with progress indicator.
- Authenticated app shell: sidebar + topbar (desktop), bottom nav (mobile), dashboard page.
- Design tokens for the black/gold visual direction.

## What's not built yet

- Verify account / forgot / reset password pages.
- Academics, Opportunities, Community, Campus, Messages, Notifications, Profile,
  Settings pages (routes/shell exist, content doesn't).
- Role-specific dashboards (`/admin`, `/adviser`, `/lecturer`, `/rep`).
- Actual API routes for register/login/most resources — only the community
  post delete route exists as a worked example of the permission pattern.
- Real-time delivery for Messages (undecided — see `docs/ARCHITECTURE.md`).
- Search implementation (direction decided: Postgres FTS; not yet built).

## Running this (once you have Postgres + Redis available)

```bash
npm install
createdb campusos && npm run db:migrate
npm run dev
```

Note: dependencies aren't installed in this environment (no network access
in the sandbox this was built in) — `npm install` needs to run wherever
you actually develop.

## Before making major architectural changes

Explain the change and why it's necessary, and update `docs/ARCHITECTURE.md`
to match — that file is the single source of truth for decisions made in
this project so nothing gets silently contradicted later.
