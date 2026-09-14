import { PublicNav } from '../components/PublicNav';

export default function ContactPage() {
  return (
    <div>
      <PublicNav />
      <section className="px-8 py-20 max-w-xl mx-auto">
        <h1 className="text-4xl text-bone mb-6">Get in touch</h1>
        <p className="text-muted mb-8">
          Questions, feedback, or want CampusOS at your university? Reach us below.
        </p>
        <form className="space-y-4">
          <input className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone" placeholder="Name" />
          <input className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone" placeholder="Email" type="email" />
          <textarea className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone" placeholder="Message" rows={5} />
          <button className="bg-gold text-ink px-6 py-3 rounded-sm font-medium hover:bg-gold-bright transition-colors">
            Send message
          </button>
        </form>
      </section>
    </div>
  );
}
