import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthContext } from '../../../lib/authz';
import { getMyCourses, getGpaSummary } from '../../../lib/academics';

const CURRENT_TERM = '2026/1';

export default async function AcademicsPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect('/auth/login');

  const [courses, gpa] = await Promise.all([
    getMyCourses(ctx.userId),
    getGpaSummary(ctx.userId, CURRENT_TERM),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl text-bone mb-1">Academics</h1>
      <p className="text-muted mb-8">Your academic journey, simplified.</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <StatCard label="My Courses" value={String(courses.length)} />
        <StatCard label="Current GPA" value={gpa.gpa !== null ? gpa.gpa.toFixed(2) : '—'} />
        <StatCard label="CGPA" value={gpa.cgpa !== null ? gpa.cgpa.toFixed(2) : '—'} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        <QuickLink title="Academic Calendar" subtitle="Important dates and deadlines" href="/academics/calendar" />
        <QuickLink title="Course Registration Guidance" subtitle="Step-by-step process and tips" href="/academics/registration" />
        <QuickLink title="Academic Resources" subtitle="Past questions, study materials" href="/academics/resources" />
        <QuickLink title="Advising & Support" subtitle="Get help when you need it" href="/academics/advising" />
      </div>

      <h2 className="text-bone text-lg mb-4">My Courses</h2>

      {courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/academics/courses/${course.id}`}
              className="block bg-surface border border-border rounded-md p-4 hover:border-gold/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-bone">
                    <span className="text-gold">{course.code}</span> — {course.title}
                  </p>
                  {course.description && (
                    <p className="text-muted text-sm mt-1 line-clamp-1">{course.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted whitespace-nowrap ml-4">{course.term}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4 text-center">
      <p className="text-2xl text-gold mb-1">{value}</p>
      <p className="text-muted text-xs">{label}</p>
    </div>
  );
}

function QuickLink({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <Link href={href} className="bg-surface border border-border rounded-md p-4 hover:border-gold/40 transition-colors">
      <p className="text-bone text-sm">{title}</p>
      <p className="text-muted text-xs mt-1">{subtitle}</p>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-md p-8 text-center">
      <p className="text-bone mb-1">No courses yet</p>
      <p className="text-muted text-sm">
        Once you're enrolled in courses for this term, they'll show up here.
      </p>
    </div>
  );
}
