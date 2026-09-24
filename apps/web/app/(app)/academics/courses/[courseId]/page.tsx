import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getAuthContext } from '../../../../../lib/authz';
import {
  getCourse,
  hasCourseAccess,
  getCourseResources,
  getCourseAssignments,
} from '../../../../../lib/academics';

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/auth/login');

  const course = await getCourse(params.courseId);
  if (!course) notFound(); // course doesn't exist at all

  const allowed = await hasCourseAccess(ctx.userId, course.orgNodeId);
  if (!allowed) notFound(); // exists, but this user has no membership — hide it,
                            // per the 403-vs-404 rule in docs/ARCHITECTURE.md:
                            // a course you're not in shouldn't confirm it exists.

  const [resources, assignments] = await Promise.all([
    getCourseResources(course.id),
    getCourseAssignments(course.id),
  ]);

  return (
    <div className="max-w-3xl">
      <Link href="/academics" className="text-sm text-muted hover:text-bone mb-6 inline-block">
        ← My Courses
      </Link>

      <h1 className="text-3xl text-bone mb-1">
        <span className="text-gold">{course.code}</span> — {course.title}
      </h1>
      {course.description && <p className="text-muted mb-10">{course.description}</p>}

      <section className="mb-10">
        <h2 className="text-bone text-lg mb-4">Resources</h2>
        {resources.length === 0 ? (
          <p className="text-muted text-sm border border-dashed border-border rounded-md p-6 text-center">
            No resources have been posted for this course yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {resources.map((r) => (
              <div key={r.id} className="bg-surface border border-border rounded-md p-4 flex justify-between items-center">
                <p className="text-bone text-sm">{r.title}</p>
                {r.fileUrl ? (
                  <a href={r.fileUrl} className="text-gold text-sm hover:text-gold-bright">
                    Open
                  </a>
                ) : (
                  <span className="text-muted text-xs">No file attached</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-bone text-lg mb-4">Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-muted text-sm border border-dashed border-border rounded-md p-6 text-center">
            No assignments posted yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {assignments.map((a) => (
              <div key={a.id} className="bg-surface border border-border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <p className="text-bone text-sm">{a.title}</p>
                  <span className="text-gold text-xs whitespace-nowrap ml-4">
                    Due {new Date(a.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {a.description && <p className="text-muted text-xs mt-1">{a.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
