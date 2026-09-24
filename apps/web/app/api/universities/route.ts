import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET() {
  const res = await db.query(
    `select id, name from universities where status = 'active' order by name`
  );
  return NextResponse.json(res.rows);
}
