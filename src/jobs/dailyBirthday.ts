// src/jobs/dailyBirthday.ts
// Sends a simple birthday greeting email to users whose birthday (month/day) is today (UTC).
// Assumes User.birthday is stored as a Date (timestamp). Year component is ignored for matching.
// Scheduling: run once shortly after startup (next midnight UTC) then every 24h.

import prisma from '../lib/prisma';
import { sendBirthdayEmail } from '../lib/email';

function msUntilNextUtcMidnight(now = new Date()) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const next = new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 50)); // +50ms buffer
  const ms = next.getTime() - now.getTime();
  
  // Cap at maximum safe timeout value (24 days)
  const MAX_SAFE_TIMEOUT = 24 * 24 * 60 * 60 * 1000; // 24 days in ms
  return Math.min(ms, MAX_SAFE_TIMEOUT);
}

let timer: NodeJS.Timeout | null = null;

export async function runBirthdayJob(forDate = new Date()) {
  const month = forDate.getUTCMonth() + 1; // 1-12
  const day = forDate.getUTCDate(); // 1-31

  // Use raw query to avoid pulling all users. Extract month/day via SQL.
  // Postgres: EXTRACT(MONTH from birthday) and EXTRACT(DAY from birthday)
  const users: Array<{ id: number; email: string; name: string | null }> = await prisma.$queryRawUnsafe(
    `SELECT id, email, name FROM "User" WHERE birthday IS NOT NULL AND EXTRACT(MONTH FROM birthday) = $1 AND EXTRACT(DAY FROM birthday) = $2`,
    month,
    day
  );

  for (const u of users) {
    // Fire & forget each send (no await sequencing needed)
    sendBirthdayEmail({ to: u.email, name: u.name || undefined }).catch(err =>
      console.error('[email] birthday send error userId=' + u.id, err)
    );
  }
  if (users.length) {
    console.log(`[birthday-job]: queued ${users.length} birthday emails for ${month}-${day}`);
  }
}

export function scheduleDailyBirthdays() {
  if (timer) return; // idempotent
  const schedule = async () => {
    try {
      await runBirthdayJob();
    } catch (e) {
      console.error('[birthday-job]: failed run', e);
    } finally {
      // Use a safer interval - 24 hours with a small buffer
      const nextRun = Math.min(24 * 60 * 60 * 1000, 2147483647); // Cap at max 32-bit int
      timer = setTimeout(schedule, nextRun);
    }
  };
  
  const initialDelay = msUntilNextUtcMidnight();
  console.log(`[birthday-job]: Scheduling next run in ${Math.round(initialDelay / 1000 / 60)} minutes`);
  timer = setTimeout(schedule, initialDelay);
}
