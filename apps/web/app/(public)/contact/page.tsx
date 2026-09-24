import { PublicNav } from '../components/PublicNav';

// Placeholder contact details — replace each [FILL IN] with real info
// once it's decided. Search this file for "[FILL IN]" when ready.
const CONTACT_EMAIL = '[FILL IN: e.g. hello@campusos.app]';
const CONTACT_PHONE = '[FILL IN: mobile number]';

export default function ContactPage() {
  return (
    <div>
      <PublicNav />
      <section className="px-8 py-20 max-w-xl mx-auto">
        <h1 className="text-4xl text-bone mb-6">Get in touch</h1>
        <p className="text-muted mb-10">
          Questions, feedback, or want CampusOS at your university? Reach us directly.
        </p>

        <div className="grid gap-4 mb-10">
          <ContactRow label="Email" value={CONTACT_EMAIL} />
          <ContactRow label="Phone" value={CONTACT_PHONE} />
        </div>

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

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4 flex justify-between items-center">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-bone text-sm">{value}</span>
    </div>
  );
}
