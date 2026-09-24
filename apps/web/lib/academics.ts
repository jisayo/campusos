// Data access for Academics. Kept separate from the pages themselves so
// the SQL isn't duplicated if a future API route needs the same queries
// (e.g. for the mobile app later).

import { db } from './db';

export interface MyCourse {
  id: string;
  code: string;
  title: string;
  description: string | null;
  term: string;
  enrollmentStatus: string;
}

/** Courses the given user is currently enrolled in, most recent term first. */
export async function getMyCourses(userId: string): Promise<MyCourse[]> {
  const res = await db.query(
    `select c.id, c.code, c.title, c.description, e.term, e.status as enrollment_status
     from enrollments e
     join courses c on c.id = e.course_id
     where e.user_id = $1 and e.status in ('registered', 'active')
     order by e.term desc, c.code asc`,
    [userId]
  );
  return res.rows.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    description: r.description,
    term: r.term,
    enrollmentStatus: r.enrollment_status,
  }));
}

export interface CourseDetail {
  id: string;
  code: string;
  title: string;
  description: string | null;
  orgNodeId: string;
}

export async function getCourse(courseId: string): Promise<CourseDetail | null> {
  const res = await db.query(
    `select id, code, title, description, org_node_id from courses where id = $1`,
    [courseId]
  );
  if (res.rowCount === 0) return null;
  const c = res.rows[0];
  return { id: c.id, code: c.code, title: c.title, description: c.description, orgNodeId: c.org_node_id };
}

/** Does this user have any reason to see this course — enrolled as a
 * student, or a staff/adviser membership on its org node? Reuses
 * user_org_memberships as the single source of truth for "can see this
 * community/course", separate from enrollments (which is academic-record
 * tracking, not access control — see docs/ARCHITECTURE.md). */
export async function hasCourseAccess(userId: string, courseOrgNodeId: string): Promise<boolean> {
  const res = await db.query(
    `select 1 from user_org_memberships
     where user_id = $1 and org_node_id = $2 and status = 'active'
     limit 1`,
    [userId, courseOrgNodeId]
  );
  return (res.rowCount ?? 0) > 0;
}

export interface CourseResource {
  id: string;
  title: string;
  fileUrl: string | null;
  createdAt: string;
}

export async function getCourseResources(courseId: string): Promise<CourseResource[]> {
  const res = await db.query(
    `select id, title, file_url, created_at from course_resources
     where course_id = $1 order by created_at desc`,
    [courseId]
  );
  return res.rows.map((r) => ({
    id: r.id,
    title: r.title,
    fileUrl: r.file_url,
    createdAt: r.created_at,
  }));
}

export interface GpaSummary {
  gpa: number | null; // current term
  cgpa: number | null; // cumulative, all completed terms
  totalCredits: number;
}

// Nigerian 5-point grading scale (matches OAU and most Nigerian
// universities) — deliberately not the 4.0 scale used elsewhere.
const GRADE_POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

/** Computes current-term GPA and cumulative CGPA from graded enrollments.
 * Ungraded/in-progress courses are excluded from both calculations —
 * only courses with a recorded letter grade count. */
export async function getGpaSummary(userId: string, currentTerm: string): Promise<GpaSummary> {
  const res = await db.query(
    `select e.term, e.grade, c.credit_units
     from enrollments e
     join courses c on c.id = e.course_id
     where e.user_id = $1 and e.grade is not null`,
    [userId]
  );

  let gpaPoints = 0, gpaCredits = 0, cgpaPoints = 0, cgpaCredits = 0;
  for (const row of res.rows) {
    const points = GRADE_POINTS[row.grade as string];
    if (points === undefined) continue;
    const credits = row.credit_units as number;
    cgpaPoints += points * credits;
    cgpaCredits += credits;
    if (row.term === currentTerm) {
      gpaPoints += points * credits;
      gpaCredits += credits;
    }
  }

  return {
    gpa: gpaCredits > 0 ? round2(gpaPoints / gpaCredits) : null,
    cgpa: cgpaCredits > 0 ? round2(cgpaPoints / cgpaCredits) : null,
    totalCredits: cgpaCredits,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export interface CourseAssignment {
  id: string;
  title: string;
  description: string | null;
  dueAt: string;
}

export async function getCourseAssignments(courseId: string): Promise<CourseAssignment[]> {
  const res = await db.query(
    `select id, title, description, due_at from assignments
     where course_id = $1 order by due_at asc`,
    [courseId]
  );
  return res.rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    dueAt: r.due_at,
  }));
}
