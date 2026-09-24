-- Seed data for local development/testing of the Academics slice.
-- Safe to run repeatedly against a fresh migrated database.

insert into universities (id, slug, name, country)
values ('00000000-0000-0000-0000-000000000001', 'oau', 'Obafemi Awolowo University', 'Nigeria')
on conflict (id) do nothing;

-- Org graph: University -> Faculty -> Department -> Programme -> Level -> Course group
insert into org_nodes (id, university_id, parent_id, type, name) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', null, 'faculty', 'Faculty of Technology'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'department', 'Computer Science'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'programme', 'BSc Computer Science'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'level', '300 Level'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', 'course_group', 'CSC 301 Group')
on conflict (id) do nothing;

-- Closure table entries (self + every ancestor->descendant pair).
-- In production this is maintained by the app when org_nodes change; here
-- it's just inserted directly since we're seeding a fixed structure.
insert into org_closure (ancestor_id, descendant_id, depth) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', 0),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 1),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000012', 2),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000013', 3),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000014', 4),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 0),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012', 1),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000013', 2),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000014', 3),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000012', 0),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000013', 1),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000014', 2),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', 0),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000014', 1),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000014', 0)
on conflict (ancestor_id, descendant_id) do nothing;

-- Test student. Password is "password123" hashed with bcrypt (cost 10) —
-- login isn't wired up yet, this is just for seeding realistic data.
insert into users (id, university_id, email, password_hash, name, status, email_verified_at)
values (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000001',
  'jisayo@oau.test',
  '$2b$10$abcdefghijklmnopqrstuvKzT5G8j3H1n0Y6q4L9wXeR7sD2fA1cO',
  'Jisayo',
  'active',
  now()
)
on conflict (id) do nothing;

-- Membership: this is what grants access to the course's community/resources.
insert into user_org_memberships (user_id, org_node_id, relationship, term, status)
values ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000014', 'enrolled', '2026/1', 'active')
on conflict (user_id, org_node_id, relationship, term) do nothing;

-- The course itself, tied to the course_group org node.
insert into courses (id, university_id, org_node_id, code, title, description, credit_units)
values (
  '00000000-0000-0000-0000-000000001000',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000014',
  'CSC 301',
  'Data Structures and Algorithms',
  'Core data structures, algorithmic complexity, and problem-solving techniques for computer science majors.',
  3
)
on conflict (id) do nothing;

-- A second, completed course with a grade, purely so GPA/CGPA has real
-- data to compute against (the first course above is still in progress —
-- ungraded — matching how a current-term course actually looks).
insert into org_nodes (id, university_id, parent_id, type, name) values
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', 'course_group', 'MTH 201 Group')
on conflict (id) do nothing;
insert into org_closure (ancestor_id, descendant_id, depth) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000015', 4),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000015', 3),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000015', 2),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000015', 1),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000015', 0)
on conflict (ancestor_id, descendant_id) do nothing;
insert into courses (id, university_id, org_node_id, code, title, description, credit_units)
values (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000015',
  'MTH 201',
  'Calculus II',
  'Continuation of differential and integral calculus.',
  3
)
on conflict (id) do nothing;
insert into user_org_memberships (user_id, org_node_id, relationship, term, status)
values ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000015', 'enrolled', '2025/2', 'active')
on conflict (user_id, org_node_id, relationship, term) do nothing;
insert into enrollments (user_id, course_id, term, status, grade)
values ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000001001', '2025/2', 'completed', 'B')
on conflict (user_id, course_id, term) do nothing;

-- A community post so /community isn't empty on first load.
insert into community_posts (id, org_node_id, author_id, body)
values (
  '00000000-0000-0000-0000-000000005000',
  '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000100',
  'Has anyone started the assignment for CSC 301 yet? Looking to form a study group if a few of us are stuck on the same parts.'
)
on conflict (id) do nothing;

-- Real announcement notifications for the dashboard's "Recent Announcements" panel.
insert into notifications (id, user_id, type, title, body)
values
  ('00000000-0000-0000-0000-000000006000', '00000000-0000-0000-0000-000000000100', 'announcement', 'New Notice: 2025/2026 Academic Calendar', 'Check the updated academic calendar for the new session.'),
  ('00000000-0000-0000-0000-000000006001', '00000000-0000-0000-0000-000000000100', 'announcement', 'Exam Timetable Released', 'View your exam schedule for the current semester.')
on conflict (id) do nothing;

-- Academic-record enrollment (separate from membership — see docs/ARCHITECTURE.md).
insert into enrollments (user_id, course_id, term, status)
values ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000001000', '2026/1', 'active')
on conflict (user_id, course_id, term) do nothing;

-- A resource and an assignment so the detail page isn't empty either.
insert into course_resources (id, course_id, uploaded_by, title, file_url)
values (
  '00000000-0000-0000-0000-000000002000',
  '00000000-0000-0000-0000-000000001000',
  '00000000-0000-0000-0000-000000000100',
  'Week 1 Slides: Big-O Notation',
  null
)
on conflict (id) do nothing;

insert into assignments (id, course_id, title, description, due_at, created_by)
values (
  '00000000-0000-0000-0000-000000003000',
  '00000000-0000-0000-0000-000000001000',
  'Problem Set 1: Sorting Algorithms',
  'Implement and analyze merge sort and quick sort.',
  now() + interval '7 days',
  '00000000-0000-0000-0000-000000000100'
)
on conflict (id) do nothing;

-- Two opportunities: one Global (visible to everyone, logged in or not),
-- one OAU-specific (only visible to logged-in OAU students) — lets the
-- two-tier visibility rule actually be tested end to end.
insert into opportunities (id, university_id, category, title, organization, description, eligibility, apply_url, deadline)
values (
  '00000000-0000-0000-0000-000000004000',
  null,
  'internship',
  'Software Development Internship',
  'TechHive',
  'Remote internship working on real production features alongside a small engineering team.',
  'Open to undergraduate students in any computing-related field.',
  'https://example.com/apply',
  now() + interval '14 days'
)
on conflict (id) do nothing;

insert into opportunities (id, university_id, category, title, organization, description, eligibility, apply_url, deadline)
values (
  '00000000-0000-0000-0000-000000004001',
  '00000000-0000-0000-0000-000000000001',
  'scholarship',
  'OAU Student Research Grant',
  'OAU Office of Research',
  'Funding for undergraduate-led research projects within the Faculty of Technology.',
  'Open to OAU students in 200 level and above.',
  null,
  now() + interval '30 days'
)
on conflict (id) do nothing;

-- A polished, near-term Global opportunity — surfaces first on the
-- homepage's real-data card (ordered by soonest deadline). Modeled on
-- Google's real STEP internship program, but this is illustrative seed
-- data, not a verified current posting — apply_url points to Google's
-- general careers site rather than a specific page that might be stale.
insert into opportunities (id, university_id, category, title, organization, description, eligibility, apply_url, deadline)
values (
  '00000000-0000-0000-0000-000000004002',
  null,
  'internship',
  'Google STEP Internship 2026',
  'Google',
  'A 12-week paid internship for early-career students, pairing you with a Google engineering team to ship real features and get hands-on mentorship.',
  'Open to first- and second-year undergraduate students studying Computer Science or a related field, worldwide.',
  'https://careers.google.com',
  now() + interval '9 days'
)
on conflict (id) do nothing;
