import Image from 'next/image';
import { PublicNav } from '../components/PublicNav';

const FEATURES = [
  { icon: <AcademicsIcon />, title: 'Academics', body: 'Courses, resources, academic calendar, and more.' },
  { icon: <OpportunitiesIcon />, title: 'Opportunities', body: 'Jobs, internships, scholarships, projects and competitions.' },
  { icon: <CommunityIcon />, title: 'Community', body: 'Join groups, discuss, and connect with your peers.' },
  { icon: <CampusIcon />, title: 'Campus', body: 'Maps, services, transport, and campus information.' },
  { icon: <CalculatorIcon />, title: 'CGPA Calculator', body: 'Calculate and track your academic performance.' },
  { icon: <SearchIcon />, title: 'Discover', body: 'Find opportunities, universities, communities and more.' },
];

export default function FeaturesPage() {
  return (
    <div>
      <div className="relative overflow-hidden">
        <Image src="/hero.jpg" alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative">
          <PublicNav />
          <section className="px-8 pt-16 pb-16 max-w-3xl mx-auto text-center">
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-4">Features</p>
            <h1 className="text-4xl text-bone mb-4">Everything you need, all in one place.</h1>
            <p className="text-muted">
              Explore the core features that make CampusOS the ultimate platform for university life.
            </p>
          </section>
        </div>
      </div>

      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-surface border border-border rounded-md p-6 hover:border-gold/40 transition-colors">
              <div className="w-10 h-10 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4">
                {f.icon}
              </div>
              <h3 className="text-bone mb-1.5">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AcademicsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5" /></svg>;
}
function OpportunitiesIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="13" rx="1.5" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" /></svg>;
}
function CommunityIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="17" cy="8" r="2.3" opacity="0.6" /><path d="M16 14.2c2.9.5 5 2.6 5 5.8" opacity="0.6" /></svg>;
}
function CampusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" /></svg>;
}
function CalculatorIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" /></svg>;
}
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>;
}
