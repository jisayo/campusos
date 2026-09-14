import { PublicNav } from '../components/PublicNav';

const features = [
  { title: 'Academics', body: 'Courses, resources, assignments, and your academic calendar, filtered to your programme and level.' },
  { title: 'Opportunities', body: 'Scholarships, internships, jobs, and projects — with real deadlines, not a static bulletin board.' },
  { title: 'Community', body: 'Groups scoped to your university, faculty, department, programme, level, and course — join what is relevant to you.' },
  { title: 'Campus', body: 'Maps, services, transport, and contacts for your specific campus.' },
  { title: 'Messages', body: 'Direct conversations with classmates and staff, without leaving CampusOS.' },
];

export default function FeaturesPage() {
  return (
    <div>
      <PublicNav />
      <section className="px-8 py-20 max-w-3xl mx-auto">
        <h1 className="text-4xl text-bone mb-10">What's inside</h1>
        <div className="space-y-8">
          {features.map((f) => (
            <div key={f.title} className="border-b border-border pb-8">
              <h2 className="text-bone text-xl mb-2">{f.title}</h2>
              <p className="text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
