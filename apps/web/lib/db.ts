import { Pool } from 'pg';

// Singleton pool — reused across requests/middleware invocations.
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
