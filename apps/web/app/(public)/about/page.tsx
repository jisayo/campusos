import Link from 'next/link';
import Image from 'next/image';
import { PublicNav } from '../components/PublicNav';

const PROBLEM_ITEMS = ['School websites', 'Portals', 'WhatsApp groups', 'Telegram groups', 'Notice boards', 'Word of mouth'];

export default function AboutPage() {
  return (
    <div>
      <div className="relative overflow-hidden">
        <Image src="/hero.jpg" alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative">
          <PublicNav />
          <section className="px-8 pt-16 pb-20 max-w-2xl mx-auto text-center">
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-4">About us</p>
            <h1 className="text-4xl text-bone mb-6 leading-tight">
              We're building the digital layer of university life.
            </h1>
            <p className="text-muted leading-relaxed">
              CampusOS brings together the scattered pieces of university life —
              academics, opportunities, communities, and campus information —
              into one place.
            </p>
          </section>
        </div>
      </div>

      <section className="px-8 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-bone text-xl mb-4">The problem</h2>
            <p className="text-muted text-sm mb-4">University information is scattered across:</p>
            <ul className="space-y-2">
              {PROBLEM_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-muted text-sm">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-bone text-xl mb-4">Our philosophy</h2>
            <div className="grid gap-4">
              <PhilosophyCard title="Built around students" body="Designed for real student needs." />
              <PhilosophyCard title="Adapted to universities" body="Works across different institutions." />
              <PhilosophyCard title="Designed to grow" body="From V1 to a bigger future." />
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-bone text-xl mb-10">Our ecosystem</h2>
          <div className="flex flex-col items-center">
            <div className="bg-gold text-ink px-6 py-3 rounded-md font-medium mb-8">CampusOS</div>
            <div className="grid grid-cols-3 gap-6 w-full">
              <EcosystemNode title="Students" subtitle="Learn · Connect · Grow" />
              <EcosystemNode title="Universities" subtitle="Manage · Support · Engage" />
              <EcosystemNode title="Communities" subtitle="Share · Discuss · Build" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto bg-surface border border-border rounded-md p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-bone text-lg mb-1">One platform. Multiple universities.</p>
            <p className="text-muted text-sm max-w-md">
              CampusOS is designed to work across different institutions, not
              just one. You get the same great experience, no matter where you study.
            </p>
          </div>
          <Link href="/auth/register" className="bg-gold text-ink px-6 py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors whitespace-nowrap">
            Get Started →
          </Link>
        </div>
      </section>
    </div>
  );
}

function PhilosophyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <p className="text-bone text-sm mb-1">{title}</p>
      <p className="text-muted text-xs">{body}</p>
    </div>
  );
}

function EcosystemNode({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <p className="text-bone text-sm mb-1">{title}</p>
      <p className="text-muted text-xs">{subtitle}</p>
    </div>
  );
}
