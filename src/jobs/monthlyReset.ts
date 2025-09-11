// src/jobs/monthlyReset.ts
// Resets monthlyPoints for all users at the start of each UTC month.
// Also archives the previous month into an optional historical table in future (placeholder).

import prisma from '../lib/prisma';

export async function resetMonthlyPoints() {
  // Single SQL update; could be large but simple. Consider batching if user count huge.
  await prisma.$executeRawUnsafe('UPDATE "User" SET "monthlyPoints" = 0');
}

// Compute ms until next month UTC
function msUntilNextMonthUTC(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const firstNext = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  return firstNext.getTime() - now.getTime();
}

let timer: NodeJS.Timeout | null = null;

export function scheduleMonthlyReset() {
  if (timer) return; // idempotent
  const schedule = async () => {
    try {
      await resetMonthlyPoints();
      // After running, schedule next month
      timer = setTimeout(schedule, msUntilNextMonthUTC());
    } catch (e) {
      console.error('Monthly points reset failed:', e);
      // Retry in 1 hour if failure
      timer = setTimeout(schedule, 60 * 60 * 1000);
    }
  };
  // Initial delay until next month boundary
  timer = setTimeout(schedule, msUntilNextMonthUTC());
}
