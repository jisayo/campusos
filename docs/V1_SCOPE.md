# CampusOS — V1 Scope (canonical reference)

Extracted from the design spec sheet. This supersedes earlier, less
precise scope discussions — if something built later contradicts this,
that's the signal to update this file and say why, not to silently drift.

## Included in V1

**Public:** Home, Discover, Universities, Features, Opportunities, About, Contact
**Auth:** Login / Signup + Onboarding
**App:** Dashboard, Academics (**including CGPA calculator**), Opportunities,
Community, Campus, Messaging (**1:1 only**), Notifications, Profile & Settings
**Platform:** Search, Filters, Personalization, RBAC + Admin Dashboard
**Security:** input validation, XSS/SQL-injection/CSRF protection, rate
limiting, logging

## Explicitly deferred (post-V1)

Advanced/group messaging, Quiz Centre, LearnRithm integration, Google
Classroom integration, localization/translation, smart notifications,
advanced campus map.

## Explicitly later / expansion

Marketplace/Commerce (still **no payments** anywhere), Accommodation Hub,
dedicated transport system, digital identity, broader third-party integrations.

## Standing product rules (repeated across every scope doc so far — not negotiable by omission)

- Global information (scholarships, remote opportunities) is visible to
  everyone, everywhere.
- University-specific information (courses, campus map, announcements)
  only shows once a university is selected/known.
- CampusOS is designed for many universities from day one — never
  architected or worded as OAU-exclusive.

## Open question from the latest spec sheet

Admin Dashboard is listed as V1 here, but earlier dev-order discussions
placed role-specific dashboards (Admin/Adviser/Lecturer/Rep) after the
student-facing app was complete. Needs an explicit decision: build
Admin Dashboard alongside Community/Campus now, or hold it for after.

## Known gap: imagery

This design uses real photography on multiple pages (hero, About,
Universities directory, per-university cards) — not just the homepage
hero. Each needs an owned or properly licensed image; none of this can
be sourced automatically (see docs/ARCHITECTURE.md, "Homepage hero image").
