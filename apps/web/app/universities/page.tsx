import { PublicNav } from '../(public)/components/PublicNav';
import { searchUniversities, getUniversityCountries } from '../../lib/universities';

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: { q?: string; country?: string };
}) {
  const [universities, countries] = await Promise.all([
    searchUniversities(searchParams.q),
    getUniversityCountries(),
  ]);

  const filtered = searchParams.country
    ? universities.filter((u) => u.country === searchParams.country)
    : universities;

  // Group by country for the sectioned list, matching the reference layout.
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, u) => {
    (acc[u.country] ||= []).push(u);
    return acc;
  }, {});

  return (
    <div>
      <PublicNav />
      <div className="max-w-2xl mx-auto px-8 py-16">
        <h1 className="text-3xl text-bone mb-1">Find your campus.</h1>
        <p className="text-muted mb-8">Explore universities available on CampusOS.</p>

        <form className="mb-6">
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search universities..."
            className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-bone"
          />
        </form>

        <div className="flex gap-2 mb-8 flex-wrap">
          <CountryTab country={undefined} label="All" active={!searchParams.country} q={searchParams.q} />
          {countries.map((c) => (
            <CountryTab key={c} country={c} label={c} active={searchParams.country === c} q={searchParams.q} />
          ))}
        </div>

        {Object.keys(grouped).length === 0 ? (
          <p className="text-muted text-sm border border-dashed border-border rounded-md p-8 text-center">
            No universities found.
          </p>
        ) : (
          Object.entries(grouped).map(([country, unis]) => (
            <div key={country} className="mb-8">
              <p className="text-muted text-xs uppercase tracking-wide mb-3">{country}</p>
              <div className="grid gap-3">
                {unis.map((u) => (
                  <div key={u.id} className="bg-surface border border-border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="text-bone text-sm">{u.name}</p>
                      <p className="text-muted text-xs">{u.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CountryTab({ country, label, active, q }: { country?: string; label: string; active: boolean; q?: string }) {
  const params = new URLSearchParams();
  if (country) params.set('country', country);
  if (q) params.set('q', q);
  const href = params.toString() ? `/universities?${params.toString()}` : '/universities';
  return (
    <a
      href={href}
      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
        active ? 'bg-gold text-ink border-gold font-medium' : 'border-border text-muted hover:border-gold/40 hover:text-bone'
      }`}
    >
      {label}
    </a>
  );
}
