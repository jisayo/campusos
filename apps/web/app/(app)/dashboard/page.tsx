// This reads x-user-id set by middleware.ts, then would query courses,
// assignments, opportunities, and notifications scoped to this user's
// org memberships. Data fetching stubbed with representative shape so
// the layout/hierarchy is real even before the queries are wired up.

import { headers } from 'next/headers';

export default async function DashboardPage() {
  const userId = headers().get('x-user-id');

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl text-bone mb-1">Good evening.</h1>
      <p className="text-muted mb-8">Stay focused, keep building, and make the most of your campus experience.</p>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-bone text-lg">Upcoming & important</h2>
          <a href="/discover" className="text-sm text-gold">View all</a>
        </div>
        <div className="grid gap-3">
          <Card date="SEP 16" title="Course Registration Guidance" subtitle="10:00 AM" />
          <Card date="SEP 18" title="Faculty Orientation" subtitle="Main Auditorium · 9:00 AM" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-bone text-lg">Recent opportunities</h2>
          <a href="/opportunities" className="text-sm text-gold">View all</a>
        </div>
        <div className="grid gap-3">
          <Card date="Internship" title="Software Development Internship" subtitle="TechHive · Remote" />
        </div>
      </section>
    </div>
  );
}

function Card({ date, title, subtitle }: { date: string; title: string; subtitle: string }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4 flex justify-between items-center">
      <div>
        <p className="text-bone">{title}</p>
        <p className="text-muted text-sm">{subtitle}</p>
      </div>
      <span className="text-gold text-sm">{date}</span>
    </div>
  );
}
