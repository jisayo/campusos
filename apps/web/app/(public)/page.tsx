import Link from 'next/link';
import { PublicNav } from './components/PublicNav';

export default function HomePage() {
  return (
    <div>
      <PublicNav />

      <section className="px-8 py-20 max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl leading-tight text-bone mb-6">
            Your courses, your deadlines, your people —
            <span className="text-gold"> one place.</span>
          </h1>
          <p className="text-muted text-lg mb-8 max-w-md">
            CampusOS pulls together your academics, opportunities, and campus
            community so you stop juggling five apps to run one semester.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/register" className="bg-gold text-ink px-6 py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors">
              Create your account
            </Link>
            <Link href="/features" className="border border-border px-6 py-3 rounded-sm text-bone hover:border-gold transition-colors">
              See what's inside
            </Link>
          </div>
        </div>

        {/* Grounded hero visual: a real artifact of student life, not an abstract graphic */}
        <div className="bg-surface border border-border rounded-md p-6 space-y-4">
          <p className="text-xs text-muted mb-2">Upcoming</p>
          <div className="flex justify-between items-start border-b border-border pb-4">
            <div>
              <p className="text-bone">Course Registration Guidance</p>
              <p className="text-muted text-sm">10:00 AM</p>
            </div>
            <span className="text-gold text-sm">Sep 16</span>
          </div>
          <div className="flex justify-between items-start pb-4">
            <div>
              <p className="text-bone">Faculty Orientation</p>
              <p className="text-muted text-sm">Main Auditorium · 9:00 AM</p>
            </div>
            <span className="text-gold text-sm">Sep 18</span>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-bone text-sm">Software Development Internship</p>
            <p className="text-muted text-xs">TechHive · Remote · Apply by Sep 30</p>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-bone mb-2">Academics, actually organized</h3>
            <p className="text-muted text-sm">Courses, resources, and assignments sorted by what's relevant to your programme and level — not a shared drive.</p>
          </div>
          <div>
            <h3 className="text-bone mb-2">Opportunities that find you</h3>
            <p className="text-muted text-sm">Internships, scholarships, and jobs matched to your department, with deadlines that don't sneak up on you.</p>
          </div>
          <div>
            <h3 className="text-bone mb-2">A community scoped to you</h3>
            <p className="text-muted text-sm">Your faculty, department, and course groups — not a firehose of every student at every school.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
