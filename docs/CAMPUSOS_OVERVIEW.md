# CampusOS

*A digital operating system for university life.*

## What it is

CampusOS is a platform that brings together the scattered pieces of university life — academics, opportunities, student communities, and campus information — into one place. Right now, a student's semester runs across a school portal, a dozen WhatsApp groups, notice boards, department emails, and word of mouth. CampusOS replaces that fragmentation with a single, personalized experience.

It's built as a real product from day one, not a single-school project — the architecture supports any number of universities, each with its own faculties, departments, programmes, and communities, without the platform ever being rebuilt to add a new one.

## The problem it solves

University information isn't missing — it's *scattered*. A registration deadline lives on the school portal. The internship posting lives on LinkedIn. The class group chat lives on WhatsApp. The department announcement lives on a notice board nobody checks. Nothing is where a student would naturally look for it, and nothing is organized around what's actually relevant to *them* — their faculty, their level, their courses.

CampusOS's answer: a platform that adapts to who you are (which university, faculty, department, level, and courses you belong to) and surfaces only what's relevant, while still letting anyone browse genuinely useful public content — like open scholarships — without creating an account first.

## Who it's for

Primarily undergraduate students. Beyond students, the platform recognizes four other roles with distinct responsibilities rather than just different pages:

- **Students** — the primary users: browsing, participating, learning, discovering.
- **Class Representatives** — manage announcements and communication for their specific class/community.
- **Lecturers** — manage their own courses: resources, assignments, announcements.
- **Advisers** — an observe-and-report role. They can see relevant students and activity and file reports, but deliberately cannot take direct administrative action (suspend, delete, change roles) — that authority stays with Admins.
- **Admins** — full platform operation: user management, moderation, academic structure, security, and audit oversight.

## The four pillars

CampusOS is organized around four areas, with the first version deliberately focused on two of them:

- **Study** *(V1 priority)* — courses, academic resources, assignments, the academic calendar, and registration guidance. CampusOS doesn't replace a university's official academic system; it explains what's happening ("registration is open") and points toward the real process.
- **Career** *(V1 priority)* — internships, scholarships, jobs, fellowships, and competitions, with real deadlines and eligibility — meant to become one of the platform's strongest features.
- **Social** *(V1, secondary)* — communities structured around actual university relationships (faculty → department → programme → level → course) rather than one undifferentiated feed, so information reaches the people it's actually relevant to.
- **Commerce** *(explicitly not V1)* — a future campus marketplace concept, intentionally left out so it doesn't dilute the first version. There are no payments anywhere in V1.

## What it can actually do

**Before logging in:**
Visitors can browse global opportunities (scholarships, internships, competitions not tied to one school), read about how the platform works, and see what CampusOS offers — without being immediately walled behind a sign-up page.

**After logging in, personalized to your university:**

- **Dashboard** — a daily overview: upcoming academic dates, recent opportunities, community activity, all filtered to what's relevant to you.
- **Academics** — your enrolled courses, each with its own resources and assignments; only visible if you're actually a member of that course's community.
- **Opportunities** — scholarships, internships, jobs, and projects, split between ones open to every university (Global) and ones specific to yours.
- **Community** — groups scoped to your university, faculty, department, programme, level, and courses — not a single firehose feed.
- **Campus** — maps, services, and information specific to your physical campus.
- **Messages** — direct conversations with classmates and staff (group chat is supported by the underlying design and will follow later).
- **Notifications** — announcements and deadline reminders, delivered without overwhelming thousands of people at once even for large, campus-wide notices.

**Role-specific views** (Admin, Adviser, Lecturer, Rep dashboards) are the same underlying data — courses, communities, reports — filtered and composed differently depending on what that role is responsible for, not separate systems.

## How the multi-university design actually works

Every piece of information in CampusOS is either **Global** (visible to every university — a worldwide scholarship, a general study resource) or **university-specific** (visible only within that university's context — a course, a campus map, a department announcement). A student at one university never sees another university's internal content, but everyone sees the same pool of genuinely global opportunities. This single rule is what keeps the platform from quietly becoming "an app for one school" as more universities join.

## Design direction

Black and gold, deliberately avoiding the look of a traditional university portal — the intent is for CampusOS to feel like a confident, modern technology product a student would *choose* to use, not an administrative system they're required to use.

## What's real right now vs. what's planned

Being direct about this matters more than it sounds: CampusOS currently has a solid, working foundation — the full database design (multi-tenancy, the university/faculty/department org structure, role-based permissions, courses, opportunities, community, messaging schema, notifications), a working authentication and authorization system, and one fully functional feature end-to-end (Academics: real course listings, real access control, real data). Opportunities, Community, Campus, Messages, and the role-specific dashboards are designed but not yet built as working features — that's the active roadmap, being built one complete vertical slice at a time rather than many shallow, unfinished pages at once.

## The one-line version

**CampusOS is a scalable platform for university life that brings academic information, career opportunities, student communities, and campus utilities into one experience — personalized to your specific university, without ever being built as though it only serves one.**
