import { db } from './db';

export interface UniversityListing {
  id: string;
  name: string;
  country: string;
}

export async function searchUniversities(query?: string): Promise<UniversityListing[]> {
  const res = await db.query(
    `select id, name, country from universities
     where status = 'active'
       and ($1::text is null or name ilike '%' || $1 || '%')
     order by country, name`,
    [query || null]
  );
  return res.rows;
}

/** Distinct countries currently represented, for the filter tabs. */
export async function getUniversityCountries(): Promise<string[]> {
  const res = await db.query(
    `select distinct country from universities where status = 'active' order by country`
  );
  return res.rows.map((r) => r.country);
}
