// Notifications fan-out.
//
// Problem: a deadline reminder or department-wide announcement can target
// thousands of users at once (see docs/ARCHITECTURE.md). Inserting all of
// those rows inline, in the request that triggers the notification, would
// block that request for seconds and risks a partial write if it fails
// halfway.
//
// Approach: the triggering action just inserts ONE row into
// `notification_fanout_jobs` (fast, always succeeds). A background worker
// picks up pending jobs and expands them into individual `notifications`
// rows in bounded batches, using `cursor_user_id` to resume safely if the
// process restarts mid-job — so a crash mid-fanout re-runs from the last
// completed batch instead of re-notifying everyone or dropping the rest.

import type { Pool } from 'pg';

const BATCH_SIZE = 500;

export async function processNextFanoutJob(db: Pool): Promise<boolean> {
  // Claim one pending job atomically so multiple worker instances don't
  // double-process the same job.
  const claimed = await db.query(
    `update notification_fanout_jobs
     set status = 'processing'
     where id = (
       select id from notification_fanout_jobs
       where status = 'pending'
       order by created_at
       limit 1
       for update skip locked
     )
     returning *`
  );
  if (claimed.rowCount === 0) return false;

  const job = claimed.rows[0];

  try {
    let cursor = job.cursor_user_id;
    while (true) {
      // Target audience = everyone with an active membership at this org
      // node or any descendant of it (e.g. a Faculty announcement reaches
      // every Department/Level/Course under it) — reuses org_closure.
      const usersRes = await db.query(
        `select distinct u.id from users u
         join user_org_memberships m on m.user_id = u.id and m.status = 'active'
         join org_closure c on c.descendant_id = m.org_node_id
         where u.university_id = $1
           and ($2::uuid is null or c.ancestor_id = $2)
           and u.status = 'active'
           and ($3::uuid is null or u.id > $3)
         order by u.id
         limit $4`,
        [job.university_id, job.org_node_id, cursor, BATCH_SIZE]
      );

      if (usersRes.rowCount === 0) break;

      const values = usersRes.rows
        .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
        .join(',');
      const params = usersRes.rows.flatMap((u) => [
        u.id,
        job.type,
        job.title,
        job.body,
        job.link,
      ]);
      await db.query(
        `insert into notifications (user_id, type, title, body, link) values ${values}`,
        params
      );

      cursor = usersRes.rows[usersRes.rows.length - 1].id;
      await db.query(
        `update notification_fanout_jobs set cursor_user_id = $1 where id = $2`,
        [cursor, job.id]
      );

      if (usersRes.rowCount < BATCH_SIZE) break; // last page
    }

    await db.query(
      `update notification_fanout_jobs set status = 'done', completed_at = now() where id = $1`,
      [job.id]
    );
  } catch (err) {
    await db.query(`update notification_fanout_jobs set status = 'failed' where id = $1`, [job.id]);
    throw err;
  }

  return true;
}

/** Called by the triggering action (e.g. "Lecturer publishes an announcement"). */
export async function enqueueFanout(
  db: Pool,
  params: {
    universityId: string;
    orgNodeId: string | null; // null = whole university
    type: string;
    title: string;
    body?: string;
    link?: string;
  }
) {
  await db.query(
    `insert into notification_fanout_jobs (university_id, org_node_id, type, title, body, link)
     values ($1, $2, $3, $4, $5, $6)`,
    [params.universityId, params.orgNodeId, params.type, params.title, params.body, params.link]
  );
}
