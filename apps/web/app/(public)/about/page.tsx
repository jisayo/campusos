import { PublicNav } from '../components/PublicNav';

export default function AboutPage() {
  return (
    <div>
      <PublicNav />
      <section className="px-8 py-20 max-w-3xl mx-auto">
        <h1 className="text-4xl text-bone mb-6">Built for how university actually works.</h1>
        <p className="text-muted leading-relaxed mb-4">
          Registration deadlines, department announcements, internship postings,
          and the group chat for your 300-level class all compete for your
          attention in different apps. CampusOS puts them in one place, scoped
          to your university, your faculty, and your course groups — nothing
          more, nothing less.
        </p>
        <p className="text-muted leading-relaxed">
          CampusOS is built to work across universities, not just one. Once you
          select your school during sign-up, everything you see — courses,
          communities, campus information — is specific to it.
        </p>
      </section>
    </div>
  );
}
