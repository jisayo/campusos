-- CampusOS core schema
-- Design decisions this schema encodes (see docs/ARCHITECTURE.md for full rationale):
--   1. Multi-tenant via tenant_id (= university) on every row that isn't global reference data.
--   2. Org structure modeled as a graph (org_nodes) + a precomputed closure table (org_closure)
--      for O(1) ancestor/descendant permission checks, not runtime recursive CTEs.
--   3. Roles attach to a scope org_node, not globally — enables fine-grained RBAC without
--      role-type explosion (see docs/ARCHITECTURE.md "Permission resolution").
--   4. Messaging schema supports group conversations from day one; MVP UI only exposes 1:1.

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- for Approach A search (see docs/ARCHITECTURE.md)

-- ============================================================
-- TENANCY
-- ============================================================

create table universities (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,               -- e.g. 'oau'
  name text not null,
  country text not null,
  status text not null default 'active',   -- active | pending | disabled
  created_at timestamptz not null default now()
);

-- ============================================================
-- ORG GRAPH  (University -> Faculty -> Department -> Programme -> Level -> Course/Group)
-- ============================================================

create table org_nodes (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid not null references universities(id),
  parent_id uuid references org_nodes(id),          -- primary parent, for breadcrumbs/display
  type text not null check (type in
    ('university','faculty','department','programme','level','course_group','club')),
  name text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index idx_org_nodes_university on org_nodes(university_id);
create index idx_org_nodes_parent on org_nodes(parent_id);

-- Closure table: one row per (ancestor, descendant) pair, including depth=0 self-pairs.
-- Rebuilt/updated only when org structure changes (rare) — see docs/ARCHITECTURE.md
-- for why this trades write cost for read speed.
create table org_closure (
  ancestor_id uuid not null references org_nodes(id) on delete cascade,
  descendant_id uuid not null references org_nodes(id) on delete cascade,
  depth int not null,
  primary key (ancestor_id, descendant_id)
);
create index idx_org_closure_descendant on org_closure(descendant_id);

-- ============================================================
-- USERS, MEMBERSHIP, ROLES
-- ============================================================

create table users (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid not null references universities(id),
  email text not null,
  password_hash text not null,             -- never store plaintext (brief rule #7)
  name text not null,
  avatar_url text,
  status text not null default 'pending',  -- pending | active | suspended
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (university_id, email)
);
create index idx_users_university on users(university_id);

-- Which org nodes a user currently/previously belongs to (dept, level, course group, etc.)
create table user_org_memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  org_node_id uuid not null references org_nodes(id) on delete cascade,
  relationship text not null check (relationship in ('enrolled','staff','advisee','rep')),
  term text,                                -- e.g. '2026/1'; null = permanent (dept/faculty)
  status text not null default 'active',    -- active | past
  created_at timestamptz not null default now(),
  unique (user_id, org_node_id, relationship, term)
);
create index idx_uom_user on user_org_memberships(user_id);
create index idx_uom_org_node on user_org_memberships(org_node_id);

-- Roles are scoped to an org node (nullable = tenant-wide, e.g. university Admin)
create table roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  scope_org_node_id uuid references org_nodes(id),   -- null = whole university
  role_type text not null check (role_type in ('student','rep','lecturer','adviser','admin')),
  granted_by uuid references users(id),
  granted_at timestamptz not null default now()
);
create index idx_roles_user on roles(user_id);
create index idx_roles_scope on roles(scope_org_node_id);

-- ============================================================
-- ACADEMICS
-- ============================================================

create table courses (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid not null references universities(id),
  org_node_id uuid not null references org_nodes(id),  -- the course_group node
  code text not null,                                   -- e.g. 'CSC 201'
  title text not null,
  description text,
  created_at timestamptz not null default now()
);
create index idx_courses_university on courses(university_id);

create table course_resources (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  uploaded_by uuid not null references users(id),
  title text not null,
  file_url text,
  created_at timestamptz not null default now()
);

create table assignments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);
create index idx_assignments_course_due on assignments(course_id, due_at);

-- Enrollment is distinct from org membership: a student is a *member* of a
-- course_group org node the moment they join, but "enrolled" here tracks
-- the academic-record lifecycle (registered -> active -> completed/withdrawn)
-- which the Registration Guidance flow (seen in the mockups) walks through.
create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  term text not null,
  status text not null default 'registered'
    check (status in ('registered','active','completed','withdrawn')),
  grade text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id, term)
);
create index idx_enrollments_user on enrollments(user_id);
create index idx_enrollments_course on enrollments(course_id);

create table assignment_submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  file_url text,
  body text,
  submitted_at timestamptz not null default now(),
  status text not null default 'submitted'
    check (status in ('submitted','late','graded')),
  grade text,
  feedback text,
  unique (assignment_id, user_id)
);
create index idx_submissions_assignment on assignment_submissions(assignment_id);

-- ============================================================
-- OPPORTUNITIES
-- ============================================================

create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references universities(id), -- null = visible to all universities
  category text not null check (category in
    ('scholarship','internship','job','fellowship','competition','project')),
  title text not null,
  organization text not null,
  description text,
  eligibility text,
  apply_url text,
  deadline timestamptz,
  created_at timestamptz not null default now()
);
create index idx_opportunities_deadline on opportunities(deadline);
create index idx_opportunities_search on opportunities using gin (
  to_tsvector('english', title || ' ' || organization || ' ' || coalesce(description,''))
);

-- ============================================================
-- COMMUNITY
-- ============================================================

create table community_posts (
  id uuid primary key default uuid_generate_v4(),
  org_node_id uuid not null references org_nodes(id), -- which community this post belongs to
  author_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_posts_org_node on community_posts(org_node_id, created_at desc);

-- ============================================================
-- MESSAGING  (schema supports groups; MVP UI ships 1:1 only)
-- ============================================================

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  is_group boolean not null default false,
  title text,                              -- used for groups only
  created_at timestamptz not null default now()
);

create table conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_messages_conversation on messages(conversation_id, created_at);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,                      -- announcement | assignment | opportunity | community | security | admin
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user_unread on notifications(user_id, read_at);

-- Outbox for fan-out jobs (e.g. "notify everyone in course_group X").
-- A worker expands this into individual `notifications` rows in batches,
-- rather than the triggering request inserting thousands of rows inline.
-- See docs/ARCHITECTURE.md "Notifications fan-out".
create table notification_fanout_jobs (
  id uuid primary key default uuid_generate_v4(),
  org_node_id uuid references org_nodes(id),  -- null = whole university
  university_id uuid not null references universities(id),
  type text not null,
  title text not null,
  body text,
  link text,
  status text not null default 'pending' check (status in ('pending','processing','done','failed')),
  cursor_user_id uuid,       -- resume point if the job is interrupted mid-batch
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index idx_fanout_jobs_status on notification_fanout_jobs(status);

-- ============================================================
-- AUDIT LOG (admin actions — brief §26)
-- ============================================================

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references users(id),
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
